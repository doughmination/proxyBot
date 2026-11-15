/* src/main.ts */

import {
    ActionRowBuilder,
    ActivityType,
    type AttachmentPayload,
    ButtonBuilder,
    ButtonStyle,
    Client,
    Events,
    FileBuilder,
    GatewayIntentBits,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    MessageReferenceType,
    TextDisplayBuilder,
    type Message,
    type MessageActionRowComponentBuilder,
    type Webhook,
} from "discord.js";

import {
    frontingStatus,
    matchProxyTags,
    webhookName,
    type Member,
} from "./proxy.ts";

const apiBase = "https://doughmination.co.uk/api/plural";
const refreshMs = 5 * 60 * 1000;
const frontingRefreshMs = 60 * 1000;

const token = Deno.env.get("DISCORD_TOKEN");
const ownerId = Deno.env.get("OWNER_ID");

if (!token || !ownerId) {
    throw new Error("Set DISCORD_TOKEN and OWNER_ID in .env");
}

let members: Member[] = [];
const webhooks = new Map<string, Webhook>();

async function refreshMembers(): Promise<void> {
    try {
        const response = await fetch(`${apiBase}/members`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        members = await response.json();
        console.log(`Loaded ${members.length} members`);
    } catch (error) {
        // Keep the old list so proxying survives a site outage
        console.error("Member refresh failed:", error);
    }
}

async function getWebhook(message: Message): Promise<Webhook | null> {
    const channel = message.channel.isThread()
        ? message.channel.parent
        : message.channel;

    if (!channel || !("fetchWebhooks" in channel)) return null;

    const cached = webhooks.get(channel.id);
    if (cached) return cached;

    const existing = await channel.fetchWebhooks();
    const webhook = existing.find(
        (hook) => hook.owner?.id === client.user?.id,
    ) ?? await channel.createWebhook({
        name: "proxyBot",
    });

    webhooks.set(channel.id, webhook);
    return webhook;
}

type TopLevelComponent =
    | TextDisplayBuilder
    | ActionRowBuilder<MessageActionRowComponentBuilder>
    | MediaGalleryBuilder
    | FileBuilder;

// Webhooks can't truly reply, so link back with a button instead
async function replyButton(message: Message): Promise<ButtonBuilder | null> {
    if (message.reference?.type !== MessageReferenceType.Default) return null;

    const original = await message.fetchReference().catch(() => null);
    if (!original) return null;

    const name = original.member?.displayName ?? original.author.displayName;

    return new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(`↪ ${name}`.slice(0, 80))
        .setURL(original.url);
}

// Components v2 only shows attachments that a component points at
async function buildLayout(message: Message, content: string): Promise<{
    components: TopLevelComponent[];
    files: AttachmentPayload[];
}> {
    const components: TopLevelComponent[] = [];
    const files: AttachmentPayload[] = [];
    const button = await replyButton(message);

    if (content) {
        components.push(new TextDisplayBuilder().setContent(content));
    }

    // Own row under the text; a Section accessory sits beside it and looks wrong
    if (button) {
        components.push(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(button),
        );
    }

    const gallery = new MediaGalleryBuilder();
    const otherFiles: FileBuilder[] = [];

    for (const [index, attachment] of [...message.attachments.values()].entries()) {
        // attachment:// must match Discord's sanitised filename exactly
        const name = `${index}-${attachment.name.replace(/[^\w.-]/g, "_")}`;
        const type = attachment.contentType ?? "";

        files.push({
            attachment: attachment.url,
            name,
        });

        if (type.startsWith("image/") || type.startsWith("video/")) {
            gallery.addItems(
                new MediaGalleryItemBuilder()
                    .setURL(`attachment://${name}`)
                    .setSpoiler(attachment.spoiler),
            );
        } else {
            otherFiles.push(
                new FileBuilder()
                    .setURL(`attachment://${name}`)
                    .setSpoiler(attachment.spoiler),
            );
        }
    }

    if (gallery.items.length > 0) components.push(gallery);
    components.push(...otherFiles);

    return {
        components,
        files,
    };
}

async function handleMessage(message: Message): Promise<void> {
    if (message.author.id !== ownerId) return;
    if (message.webhookId || !message.inGuild()) return;

    const match = matchProxyTags(members, message.content);
    if (!match) return;
    if (!match.content && message.attachments.size === 0) return;

    const webhook = await getWebhook(message);
    if (!webhook) return;

    const layout = await buildLayout(message, match.content);

    await webhook.send({
        flags: MessageFlags.IsComponentsV2,
        components: layout.components,
        files: layout.files,
        username: webhookName(match.member),
        avatarURL: match.member.webhook_avatar_url
            ?? match.member.avatar_url
            ?? undefined,
        threadId: message.channel.isThread() ? message.channel.id : undefined,
        // shortcut: only user pings pass through, add role checks if you need @role or @everyone
        allowedMentions: {
            parse: ["users"],
        },
    });

    // Delete only after the proxied copy is sent, so nothing is lost
    await message.delete();
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// shortcut: polls every minute, switch to the site's /v2/ws fronters_update feed if lag bothers you
async function refreshFronting(): Promise<void> {
    if (!client.isReady()) return;

    try {
        const response = await fetch(`${apiBase}/fronters`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const fronting: { members: Member[] } = await response.json();

        client.user.setPresence({
            activities: [
                {
                    name: "Custom Status",
                    type: ActivityType.Custom,
                    state: frontingStatus(fronting.members),
                },
            ],
        });
    } catch (error) {
        // Leave the last status up rather than blanking it
        console.error("Fronting refresh failed:", error);
    }
}

client.once(Events.ClientReady, (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    refreshFronting();
    setInterval(refreshFronting, frontingRefreshMs);
});

client.on(Events.MessageCreate, (message) => {
    handleMessage(message).catch((error) => {
        console.error("Proxy failed:", error);
    });
});

await refreshMembers();
setInterval(refreshMembers, refreshMs);
await client.login(token);
