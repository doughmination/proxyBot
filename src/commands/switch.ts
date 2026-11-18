/* src/commands/switch.ts */

import type { Message } from "discord.js";

import { switchFront } from "../api/switch.ts";
import { membersByName, webhookName } from "../proxy/names.ts";
import { system } from "../state/system.ts";

export async function switchCommand(
    message: Message,
    args: string[],
): Promise<void> {
    if (args.length === 0) {
        await message.reply("Use `d!switch <member>`, like `d!switch c1`, several like `d!sw c1 c2`, or `d!sw out`.");
        return;
    }

    const switchingOut = args.length === 1 && args[0] === "out";
    const { found, missing } = switchingOut
        ? { found: [], missing: [] }
        : membersByName(system.members, args);

    if (missing.length > 0) {
        const names = missing.map((name) => `\`${name}\``).join(", ");
        await message.reply(`No member called ${names}. Use their short name, like \`c1\`.`);
        return;
    }

    const problem = await switchFront(found.map((member) => member.id));

    if (problem) {
        await message.reply(problem);
        return;
    }

    await message.reply(
        switchingOut
            ? "Switched out. Nobody is fronting."
            : `Switched in **${webhookName(found, null)}**.`,
    );
}
