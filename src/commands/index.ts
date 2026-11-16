/* src/commands/index.ts */

import type { Message } from "discord.js";

import { autoproxyCommand } from "./autoproxy.ts";
import { editCommand } from "./edit.ts";
import { explainCommand } from "./explain.ts";
import { helpCommand } from "./help.ts";
import { parseCommand } from "./parse.ts";

type CommandHandler = (
    message: Message,
    args: string[],
    rest: string,
) => Promise<void>;

const commands: Record<string, CommandHandler> = {
    edit: editCommand,
    e: editCommand,
    ex: explainCommand,
    explain: explainCommand,
    autoproxy: autoproxyCommand,
    ap: autoproxyCommand,
    help: helpCommand
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
