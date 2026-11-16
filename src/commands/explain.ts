/* src/commands/explain.ts */

import type { Message } from "discord.js";

const explainText = [
    `This bot is created by, and for <@1464890289922641993>, for faer plural system.`,
    ``,
    `> How does it work?`,
    `The bot detects messages enclosed in specific tags associated with a profile, then replaces that message under a "pseudo-account" of that profile using Discord webhooks.`,
    `Due to Discord limitations, these messages will show up with the [APP] or [BOT] tag.`,
    ``,
    `> What is Plurality?`,
    `Plurality is the state of more than 1 person or entity in a single body. You can find out more [here](<https://morethanone.info>)`,
    ``,
    `> Is this the same as PluralKit?`,
    `Yes! However, the maker dislikes PluralKit, due to previous experiences with the team. This bot was made as a replacement, using the Doughmination System API`
].join("\n");

export async function explainCommand(
    message: Message,
): Promise<void> {
    await message.reply(explainText);
}
