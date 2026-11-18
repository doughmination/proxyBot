/* src/api/fronters.ts */

import { apiBase } from "../config/constants.ts";
import { premergeAvatar } from "../discord/avatar.ts";
import { updateStatus } from "../discord/status.ts";
import type { Member } from "../proxy/types.ts";
import { system } from "../state/system.ts";

export function setFronters(fronters: Member[]): void {
    system.fronters = fronters;
    updateStatus();
    premergeAvatar(fronters);
}

export async function fetchFronters(): Promise<void> {
    try {
        const response = await fetch(`${apiBase}/fronters`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const fronting = await response.json() as { members: Member[] };
        setFronters(fronting.members);
    } catch (error) {
        // Keep the last known front rather than dropping autoproxy
        console.error("Fronting fetch failed:", error);
    }
}
