/* src/commands/index.ts */

import type { Message } from "discord.js";

import { autoproxyCommand } from "./autoproxy.ts";
import { parseCommand } from "./parse.ts";

type CommandHandler = (message: Message, args: string[]) => Promise<void>;

const commands: Record<string, CommandHandler> = {
    autoproxy: autoproxyCommand,
    ap: autoproxyCommand,
    help: (message) => message.reply(
        "`d!autoproxy` shows the state, `d!autoproxy on|off` sets it. `d!ap` works too.",
    ).then(() => {}),
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

    await handler(message, parsed.args);
    return true;
}
