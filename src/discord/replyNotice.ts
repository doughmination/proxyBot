/* src/discord/replyNotice.ts */

import {
    type APIMessageTopLevelComponent,
    type Message,
    MessageFlags,
    MessageReferenceType,
} from "discord.js";

import { ownerUserId } from "../config/env.ts";
import { client } from "./client.ts";
import { isProxied } from "./ownership.ts";
import { buildReplyCard } from "./replyCard.ts";

// Webhooks aren't accounts, so Discord never pings anyone for replies to them
export async function notifyReply(message: Message): Promise<void> {
    if (!message.inGuild() || message.webhookId || message.author.bot) return;
    if (message.author.id === ownerUserId) return;
    if (message.reference?.type !== MessageReferenceType.Default) return;

    const target = await message.fetchReference().catch(() => null);
    if (!target || !isProxied(target)) return;

    const owner = await client.users.fetch(ownerUserId);
    const components = buildReplyCard({
        replierName: message.member?.displayName ?? message.author.displayName,
        replierAvatarUrl: message.author.displayAvatarURL(),
        proxiedName: target.author.username,
        content: message.content,
        hasAttachments: message.attachments.size > 0,
        replyUrl: message.url,
    });

    await owner.send({
        flags: MessageFlags.IsComponentsV2,
        components: components as APIMessageTopLevelComponent[],
    });
}
