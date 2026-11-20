/* src/commands/reproxy.ts */

import type { Message } from "discord.js";

import { reproxyProxied } from "../discord/reproxyMessage.ts";
import { membersByName } from "../proxy/names.ts";
import { system } from "../state/system.ts";

export async function reproxyCommand(
    message: Message,
    args: string[],
): Promise<void> {
    if (args.length === 0) {
        await message.reply("Use `d$reproxy <member>`, like `d$reproxy c1`. Several work too: `d$rp c1 c2`.");
        return;
    }

    const { found, missing } = membersByName(system.members, args);

    if (missing.length > 0) {
        const names = missing.map((name) => `\`${name}\``).join(", ");
        await message.reply(`No member called ${names}. Use their short name, like \`c1\`.`);
        return;
    }

    const problem = await reproxyProxied(message, found);

    if (problem) {
        await message.reply(problem);
        return;
    }

    // Tidy like edit: the command itself disappears
    await message.delete();
}
