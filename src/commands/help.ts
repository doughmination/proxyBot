/* src/commands/help.ts */

import type { Message } from "discord.js";

const helpText = [
    "`d!edit <text>` edits the message you reply to, or your latest proxied message. `d!e` works too.",
    "`d!explain` explains the bot, and plurality. `d!ex` works too,",
    "`d!autoproxy` shows the state for this server, `d!autoproxy on|off` sets it. Add `-g` for every server, like `d!autoproxy -g off`. `d!ap` works too.",
    "`d!reproxy <member>` resends the message you reply to, or your latest proxied message, as someone else, like `d!reproxy c1`. `d!rp` works too.",
    "`d!switch <member>` sets who's fronting on the site, like `d!switch c1 c2`. `d!switch out` clears it. `d!sw` works too.",
    "-# React ❌ to delete a proxied message, ❓ to see who sent it.",
].join("\n");

export async function helpCommand(
    message: Message,
): Promise<void> {
    await message.reply(helpText);
}
