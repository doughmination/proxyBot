/* src/commands/autoproxy.ts */

import type { Message } from "discord.js";

import {
    guildSettings,
    saveSettings,
    setAutoproxyEverywhere,
    settings,
} from "../state/settings.ts";

export async function autoproxyCommand(
    message: Message,
    args: string[],
): Promise<void> {
    if (args[0] === "-g") {
        await globalAutoproxy(message, args[1]);
        return;
    }

    const [choice] = args;

    // Commands only run from server messages, so guildId is always set
    const autoproxy = guildSettings(message.guildId!).autoproxy;
    const current = autoproxy.enabled ? "on" : "off";

    if (choice === undefined) {
        await message.reply(`Autoproxy in this server is **${current}**.`);
        return;
    }

    if (choice !== "on" && choice !== "off") {
        await message.reply("Use `d!autoproxy on|off`, or `d!autoproxy -g on|off` for every server.");
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

async function globalAutoproxy(
    message: Message,
    choice: string | undefined,
): Promise<void> {
    if (choice === undefined) {
        const guilds = Object.values(settings);
        const enabledCount = guilds.filter((guild) => guild.autoproxy.enabled).length;
        await message.reply(`Autoproxy is **on** in ${enabledCount} of ${guilds.length} servers.`);
        return;
    }

    if (choice !== "on" && choice !== "off") {
        await message.reply("Use `d!autoproxy -g on` or `d!autoproxy -g off`.");
        return;
    }

    const serverCount = setAutoproxyEverywhere(choice === "on");
    await saveSettings();
    await message.reply(`Autoproxy is now **${choice}** in all ${serverCount} servers.`);
}
