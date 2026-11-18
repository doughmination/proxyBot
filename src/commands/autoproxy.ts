/* src/commands/autoproxy.ts */

import type { Message } from "discord.js";

import { guildSettings, saveSettings } from "../state/settings.ts";

export async function autoproxyCommand(
    message: Message,
    args: string[],
): Promise<void> {
    const [choice] = args;

    // Commands only run from server messages, so guildId is always set
    const autoproxy = guildSettings(message.guildId!).autoproxy;

    if (choice === "on" || choice === "off") {
        autoproxy.enabled = choice === "on";
        await saveSettings();
    } else if (choice !== undefined) {
        await message.reply("Use `d!autoproxy on` or `d!autoproxy off`.");
        return;
    }

    await message.reply(`Autoproxy in this server is **${autoproxy.enabled ? "on" : "off"}**.`);
}
