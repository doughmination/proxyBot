/* src/discord/proxyMessage.ts */

import { MessageFlags, type Message } from "discord.js";

import { runCommand } from "../commands/index.ts";
import { ownerUserId } from "../config/env.ts";
import { pickProxy } from "../proxy/autoproxy.ts";
import { webhookName } from "../proxy/names.ts";
import { guildSettings } from "../state/settings.ts";
import { system } from "../state/system.ts";
import { avatarFor } from "./avatar.ts";
import { buildLayout } from "./layout.ts";
import { wantsLinkPreview } from "./linkPreview.ts";
import { rememberSenders } from "./senders.ts";
import { getWebhook } from "./webhooks.ts";

export async function proxyMessage(message: Message): Promise<void> {
    if (message.author.id !== ownerUserId) return;
    if (message.webhookId || !message.inGuild()) return;

    // Commands never get proxied
    if (await runCommand(message)) return;

    const fronters = guildSettings(message.guildId).autoproxy.enabled ? system.fronters : [];
    const match = pickProxy(system.members, fronters, message.content);
    if (!match) return;
    if (!match.content && message.attachments.size === 0) return;

    const webhook = await getWebhook(message);
    if (!webhook) return;

    const classic = wantsLinkPreview(match.content);

    // Reply lookup and avatar merge don't depend on each other
    const [layout, avatarURL] = await Promise.all([
        buildLayout(message, match.content, classic),
        avatarFor(webhook, match.members),
    ]);

    const sent = await webhook.send({
        flags: classic ? undefined : MessageFlags.IsComponentsV2,
        content: classic ? match.content : undefined,
        components: layout.components,
        files: layout.files,
        username: webhookName(match.members, system.tag),
        avatarURL,
        threadId: message.channel.isThread() ? message.channel.id : undefined,
        // shortcut: only user pings pass through, add role checks if you need @role or @everyone
        allowedMentions: {
            parse: ["users"],
        },
    });

    rememberSenders(sent.id, match.members);

    // Delete only after the proxied copy is sent, so nothing is lost
    await message.delete();
}
