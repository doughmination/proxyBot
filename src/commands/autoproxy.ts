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
    const current = autoproxy.enabled ? "on" : "off";

    if (choice === undefined) {
        await message.reply(`Autoproxy in this server is **${current}**.`);
        return;
    }

    if (choice !== "on" && choice !== "off") {
        await message.reply("Use `d!autoproxy on` or `d!autoproxy off`.");
        return;
    }

    if (choice === current) {
        await message.reply(`Autoproxy in this server is already **${current}**.`);
        return;
    }

    autoproxy.enabled = choice === "on";
    await saveSettings();
    await message.reply(`Autoproxy in this server is now **${choice}**.`);
}
