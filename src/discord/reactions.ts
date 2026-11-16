/* src/discord/reactions.ts */

import {
    type APIMessageTopLevelComponent,
    MessageFlags,
    type MessageReaction,
    type PartialMessageReaction,
    type PartialUser,
    type User,
} from "discord.js";

import { ownerUserId } from "../config/env.ts";
import { system } from "../state/system.ts";
import { buildInfoCard } from "./infoCard.ts";
import { isProxied } from "./ownership.ts";
import { sendersOf } from "./senders.ts";

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

    const components = buildInfoCard({
        members: sendersOf(message.id),
        username: message.author.username,
        avatarUrl: message.author.displayAvatarURL(),
        messageUrl: message.url,
        ownerId: ownerUserId,
        systemName: system.name,
    });

    // DMs can be closed; the info just doesn't arrive then
    await user.send({
        flags: MessageFlags.IsComponentsV2,
        components: components as APIMessageTopLevelComponent[],
    }).catch((error) => {
        // Closed DMs are expected; anything else means the card itself is wrong
        if (error?.code !== 50007) console.error("Info DM failed:", error);
    });

    await reaction.users.remove(user.id).catch(() => {});
}
