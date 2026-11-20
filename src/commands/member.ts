/* src/commands/member.ts */

import {
    type APIMessageTopLevelComponent,
    type Message,
    MessageFlags,
} from "discord.js";

import { memberCard } from "../discord/infoCard.ts";
import { membersByName } from "../proxy/names.ts";
import { system } from "../state/system.ts";

export async function memberCommand(
    message: Message,
    args: string[],
): Promise<void> {
    if (args.length !== 1) {
        await message.reply("Use `d$member <member>`, like `d$member aether`.");
        return;
    }

    const match = membersByName(system.members, args).found[0];

    if (!match) {
        await message.reply(`No member called \`${args[0]}\`.`);
        return;
    }

    await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [memberCard(match)] as APIMessageTopLevelComponent[],
    });
}
