/* src/commands/edit.ts */

import type { Message } from "discord.js";

import { editProxied } from "../discord/editMessage.ts";

export async function editCommand(
    message: Message,
    _args: string[],
    rest: string,
): Promise<void> {
    const problem = await editProxied(message, rest);

    if (problem) {
        await message.reply(problem);
        return;
    }

    // Tidy like a real edit: the command itself disappears
    await message.delete();
}
