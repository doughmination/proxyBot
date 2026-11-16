/* src/discord/reactions.ts */

import type {
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    User,
} from "discord.js";

import { ownerUserId } from "../config/env.ts";
import { system } from "../state/system.ts";
import { isProxied } from "./ownership.ts";

const deleteEmoji = "❌";
const infoEmoji = "❓";

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

    const systemLine = system.name ? ` of **${system.name}**` : "";

    // DMs can be closed; the info just doesn't arrive then
    await user.send(
        `**${message.author.username}**${systemLine}\nSent by <@${ownerUserId}>\n${message.url}`,
    ).catch(() => {});

    await reaction.users.remove(user.id).catch(() => {});
}
