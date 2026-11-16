/* src/discord/reactions.ts */

import type {
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    User,
} from "discord.js";

import { ownerUserId } from "../config/env.ts";
import type { Member } from "../proxy/types.ts";
import { system } from "../state/system.ts";
import { isProxied } from "./ownership.ts";
import { sendersOf } from "./senders.ts";

const deleteEmoji = "❌";
const infoEmoji = "❓";

function memberLine(member: Member): string {
    const pronouns = member.pronouns ? ` (${member.pronouns})` : "";
    return `**${member.display_name ?? member.name}**${pronouns}`;
}

// One line per member when known, else the webhook name it was sent under
function senderInfo(
    messageId: string,
    username: string,
    url: string,
): string {
    const members = sendersOf(messageId);
    const lines = members ? members.map(memberLine) : [`**${username}**`];

    if (system.name) lines.push(`System: **${system.name}**`);
    lines.push(`Sent by <@${ownerUserId}>`, url);

    return lines.join("\n");
}

export async function handleReaction(
    partialReaction: MessageReaction | PartialMessageReaction,
    partialUser: User | PartialUser,
): Promise<void> {
    const emoji = partialReaction.emoji.name;
    if (emoji !== deleteEmoji && emoji !== infoEmoji) return;

    // Reactions on messages from before startup arrive as partials
    const reaction = partialReaction.partial
        ? await partialReaction.fetch()
        : partialReaction;
    const user = partialUser.partial ? await partialUser.fetch() : partialUser;
    const message = reaction.message.partial
        ? await reaction.message.fetch()
        : reaction.message;

    if (user.bot || !isProxied(message)) return;

    if (emoji === deleteEmoji) {
        // Only the system can delete its own messages
        if (user.id === ownerUserId) await message.delete();
        return;
    }

    // DMs can be closed; the info just doesn't arrive then
    await user.send(senderInfo(message.id, message.author.username, message.url))
        .catch(() => {});

    await reaction.users.remove(user.id).catch(() => {});
}
