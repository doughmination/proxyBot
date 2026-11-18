/* src/discord/reproxyMessage.ts */

import {
    type APIMessageTopLevelComponent,
    MessageFlags,
    type Message,
} from "discord.js";

import { webhookName } from "../proxy/names.ts";
import type { Member } from "../proxy/types.ts";
import { system } from "../state/system.ts";
import { avatarFor } from "./avatar.ts";
import { keepMedia } from "./editComponents.ts";
import { findTarget, searchDepth } from "./editMessage.ts";
import { rememberSenders } from "./senders.ts";
import { getWebhook } from "./webhooks.ts";

// Webhooks can't rename a sent message, so it is sent again and the old one removed.
// Returns an error to show, or null when it went through
export async function reproxyProxied(
    command: Message,
    members: Member[],
): Promise<string | null> {
    const target = await findTarget(command);
    if (!target?.webhookId) {
        return `No proxied message found. Reply to one, or send one in the last ${searchDepth} messages.`;
    }

    const webhook = await getWebhook(command);
    if (!webhook) return "Can't use webhooks in this channel.";

    const classic = !target.flags.has(MessageFlags.IsComponentsV2);
    const attachmentNames = target.attachments.map((attachment) => attachment.name);

    const sent = await webhook.send({
        flags: classic ? undefined : MessageFlags.IsComponentsV2,
        content: classic ? target.content : undefined,
        components: classic
            ? undefined
            : keepMedia(
                target.components.map((component) => component.toJSON()),
                attachmentNames,
            ) as APIMessageTopLevelComponent[],
        files: target.attachments.map((attachment) => ({
            attachment: attachment.url,
            name: attachment.name,
        })),
        username: webhookName(members, system.tag),
        avatarURL: await avatarFor(webhook, members),
        threadId: command.channel.isThread() ? command.channel.id : undefined,
        allowedMentions: {
            parse: ["users"],
        },
    });

    rememberSenders(sent.id, members);

    // Delete only after the new copy is sent, so nothing is lost
    await target.delete();
    return null;
}
