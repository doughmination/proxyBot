/* src/discord/proxyMessage.ts */

import { MessageFlags, type Message } from "discord.js";

import { runCommand } from "../commands/index.ts";
import { ownerUserId } from "../config/env.ts";
import { pickProxy } from "../proxy/autoproxy.ts";
import { webhookName } from "../proxy/names.ts";
import { settings } from "../state/settings.ts";
import { system } from "../state/system.ts";
import { avatarFor } from "./avatar.ts";
import { buildLayout } from "./layout.ts";
import { getWebhook } from "./webhooks.ts";

export async function proxyMessage(message: Message): Promise<void> {
    if (message.author.id !== ownerUserId) return;
    if (message.webhookId || !message.inGuild()) return;

    // Commands never get proxied
    if (await runCommand(message)) return;

    const fronters = settings.autoproxy ? system.fronters : [];
    const match = pickProxy(system.members, fronters, message.content);
    if (!match) return;
    if (!match.content && message.attachments.size === 0) return;

    const webhook = await getWebhook(message);
    if (!webhook) return;

    const layout = await buildLayout(message, match.content);

    await webhook.send({
        flags: MessageFlags.IsComponentsV2,
        components: layout.components,
        files: layout.files,
        username: webhookName(match.members),
        avatarURL: await avatarFor(webhook, match.members),
        threadId: message.channel.isThread() ? message.channel.id : undefined,
        // shortcut: only user pings pass through, add role checks if you need @role or @everyone
        allowedMentions: {
            parse: ["users"],
        },
    });

    // Delete only after the proxied copy is sent, so nothing is lost
    await message.delete();
}
