/* src/proxy/names.ts */

import type { Member } from "./types.ts";

// Past this many speakers, names collapse to "& N more"
export const maxNamedSpeakers = 3;

const webhookNameLimit = 80;

function displayName(member: Member): string {
    return member.display_name ?? member.name;
}

function speakerNames(members: Member[]): string {
    const named = members.slice(0, maxNamedSpeakers).map(displayName);
    const hidden = members.length - named.length;

    if (hidden > 0) named.push(`${hidden} more`);

    // "A", "A & B", "A, B & C", "A, B, C & 2 more"
    const last = named.pop();
    return named.length > 0 ? `${named.join(", ")} & ${last}` : last ?? "";
}

// Discord rejects webhook names over 80 chars or containing "discord"
export function webhookName(members: Member[], tag: string | null): string {
    const suffix = tag ? ` ~ ${tag}` : "";
    const names = speakerNames(members).slice(0, webhookNameLimit - suffix.length);

    return `${names}${suffix}`
        .replace(/discord/gi, "dïscord")
        .slice(0, webhookNameLimit);
}

// Matches the short name, like "c1", not the display name; case doesn't matter
export function membersByName(
    members: Member[],
    names: string[],
): { found: Member[]; missing: string[] } {
    const found: Member[] = [];
    const missing: string[] = [];

    for (const name of names) {
        const match = members.find(
            (member) => member.name.toLowerCase() === name.toLowerCase(),
        );

        if (match) found.push(match);
        else missing.push(name);
    }

    return {
        found,
        missing,
    };
}

// Custom status text is capped at 128 chars
export function frontingStatus(fronters: Member[]): string {
    if (fronters.length === 0) return "Nobody fronting";

    return `Fronting: ${fronters.map(displayName).join(", ")}`.slice(0, 128);
}
