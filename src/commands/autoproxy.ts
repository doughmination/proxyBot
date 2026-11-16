/* src/commands/autoproxy.ts */

import type { Message } from "discord.js";

import { saveSettings, settings } from "../state/settings.ts";

export async function autoproxyCommand(
    message: Message,
    args: string[],
): Promise<void> {
    const [choice] = args;

    if (choice === "on" || choice === "off") {
        settings.autoproxy.enabled = choice === "on";
        await saveSettings();
    } else if (choice !== undefined) {
        await message.reply("Use `d!autoproxy on` or `d!autoproxy off`.");
        return;
    }

    await message.reply(`Autoproxy is **${settings.autoproxy.enabled ? "on" : "off"}**.`);
}
