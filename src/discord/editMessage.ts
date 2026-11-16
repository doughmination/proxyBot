/* src/discord/editMessage.ts */

import {
    type APIMessageTopLevelComponent,
    MessageFlags,
    MessageReferenceType,
    type Message,
} from "discord.js";

import { client } from "./client.ts";
import { replaceText } from "./editComponents.ts";
import { isProxied } from "./ownership.ts";
import { getWebhook } from "./webhooks.ts";

const searchDepth = 50;

// The replied-to message if there is one, otherwise the newest proxied message here
async function findTarget(command: Message): Promise<Message | null> {
    if (command.reference?.type === MessageReferenceType.Default) {
        const replied = await command.fetchReference().catch(() => null);
        return replied && isProxied(replied) ? replied : null;
    }

    // The gateway already cached recent messages; only ask Discord when that misses
    const cached = command.channel.messages.cache
        .filter((message) =>
            BigInt(message.id) < BigInt(command.id) && isProxied(message)
        )
        .sort((first, second) => (BigInt(second.id) > BigInt(first.id) ? 1 : -1))
        .first();
    if (cached) return cached;

    const recent = await command.channel.messages.fetch({
        limit: searchDepth,
        before: command.id,
    });

    return recent.find(isProxied) ?? null;
}

// Returns an error to show, or null when the edit went through
export async function editProxied(
    command: Message,
    text: string,
): Promise<string | null> {
    const target = await findTarget(command);
    if (!target?.webhookId) {
        return `No proxied message found. Reply to one, or send one in the last ${searchDepth} messages.`;
    }

    if (!text && target.attachments.size === 0) {
        return "That would leave the message empty. Use ❌ to delete it instead.";
    }

    const channelWebhook = await getWebhook(command);
    const webhook = channelWebhook?.id === target.webhookId
        ? channelWebhook
        : await client.fetchWebhook(target.webhookId);

    const threadId = command.channel.isThread() ? command.channel.id : undefined;

    // Link messages were sent classic; the flag can't be added or removed later
    if (!target.flags.has(MessageFlags.IsComponentsV2)) {
        if (text.length > 2000) {
            return "Messages with links can only be 2000 characters long.";
        }

        await webhook.editMessage(target.id, {
            content: text,
            threadId,
            allowedMentions: {
                parse: ["users"],
            },
        });

        return null;
    }

    await webhook.editMessage(target.id, {
        components: replaceText(
            target.components.map((component) => component.toJSON()),
            text,
            target.attachments.map((attachment) => attachment.name),
        ) as APIMessageTopLevelComponent[],
        // Passing them back is what keeps them; leaving this out would drop them
        attachments: [...target.attachments.values()],
        threadId,
        allowedMentions: {
            parse: ["users"],
        },
    });

    return null;
}
