/* src/commands/help.ts */

import type { Message } from "discord.js";

const helpText = [
    "`d!edit <text>` edits the message you reply to, or your latest proxied message. `d!e` works too.",
    "`d!explain` explains the bot, and plurality. `d!ex` works too,",
    "`d!autoproxy` shows the state for this server, `d!autoproxy on|off` sets it. `d!ap` works too.",
    "-# React ❌ to delete a proxied message, ❓ to see who sent it.",
].join("\n");

export async function helpCommand(
    message: Message,
): Promise<void> {
    await message.reply(helpText);
}
