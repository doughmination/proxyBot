/* src/api/members.ts */

import { apiBase } from "../config/constants.ts";
import type { Member } from "../proxy/types.ts";
import { system } from "../state/system.ts";

export async function refreshMembers(): Promise<void> {
    try {
        const response = await fetch(`${apiBase}/members`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        system.members = await response.json() as Member[];
        console.log(`Loaded ${system.members.length} members`);
    } catch (error) {
        // Keep the old list so proxying survives a site outage
        console.error("Member refresh failed:", error);
    }
}
