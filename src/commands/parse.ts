/* src/commands/parse.ts */

export const commandPrefix = "d!";

export interface ParsedCommand {
    name: string;
    args: string[];
    // Everything after the name, untouched, for commands that take free text
    rest: string;
}

export function parseCommand(content: string): ParsedCommand | null {
    if (!content.toLowerCase().startsWith(commandPrefix)) return null;

    const body = content.slice(commandPrefix.length).trimStart();
    const name = body.split(/\s/, 1)[0];

    if (!name) return null;

    const rest = body.slice(name.length).trim();

    return {
        name: name.toLowerCase(),
        args: rest ? rest.toLowerCase().split(/\s+/) : [],
        rest,
    };
}
