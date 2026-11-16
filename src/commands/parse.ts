/* src/commands/parse.ts */

export const commandPrefix = "d!";

export interface ParsedCommand {
    name: string;
    args: string[];
}

export function parseCommand(content: string): ParsedCommand | null {
    if (!content.toLowerCase().startsWith(commandPrefix)) return null;

    const [name, ...args] = content
        .slice(commandPrefix.length)
        .trim()
        .split(/\s+/);

    if (!name) return null;

    return {
        name: name.toLowerCase(),
        args: args.map((arg) => arg.toLowerCase()),
    };
}
