/* src/commands/explain.ts */

import type { Message } from "discord.js";

export async function explainCommand(
    message: Message,
): Promise<void> {
    await message.reply(`This bot is created by, and for <@1464890289922641993>.\nIt's for faer plural system\n\nPlurality is the state of more than 1 person or entity in a single body. You can find out more [here](https://morethanone.info)`);
}