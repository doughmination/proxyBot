/* src/commands/index.ts */

import type { Message } from "discord.js";

import { autoproxyCommand } from "./autoproxy.ts";
import { editCommand } from "./edit.ts";
import { parseCommand } from "./parse.ts";

type CommandHandler = (
    message: Message,
    args: string[],
    rest: string,
) => Promise<void>;

const helpText = [
    "`d!edit <text>` edits the message you reply to, or your latest proxied message. `d!e` works too.",
    "`d!autoproxy` shows the state, `d!autoproxy on|off` sets it. `d!ap` works too.",
    "React ❌ to delete a proxied message, ❓ to see who sent it.",
].join("\n");

const commands: Record<string, CommandHandler> = {
    edit: editCommand,
    e: editCommand,
    autoproxy: autoproxyCommand,
    ap: autoproxyCommand,
    help: async (message) => {
        await message.reply(helpText);
    },
};

// True when the message was a command, so it isn't proxied as well
export async function runCommand(message: Message): Promise<boolean> {
    const parsed = parseCommand(message.content);
    if (!parsed) return false;

    const handler = commands[parsed.name];
    if (!handler) {
        await message.reply(`Unknown command \`${parsed.name}\`. Try \`d!help\`.`);
        return true;
    }

    await handler(message, parsed.args, parsed.rest);
    return true;
}
