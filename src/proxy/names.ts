/* src/proxy/names.ts */

import type { Member } from "./types.ts";

function displayName(member: Member): string {
    return member.display_name ?? member.name;
}

// Discord rejects webhook names over 80 chars or containing "discord"
export function webhookName(members: Member[]): string {
    return members
        .map(displayName)
        .join(" & ")
        .replace(/discord/gi, "dïscord")
        .slice(0, 80);
}

// Custom status text is capped at 128 chars
export function frontingStatus(fronters: Member[]): string {
    if (fronters.length === 0) return "Nobody fronting";

    return `Fronting: ${fronters.map(displayName).join(", ")}`.slice(0, 128);
}
