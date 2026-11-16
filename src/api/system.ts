/* src/api/system.ts */

import { apiBase } from "../config/constants.ts";
import { system } from "../state/system.ts";

export async function refreshSystem(): Promise<void> {
    try {
        const response = await fetch(`${apiBase}/system`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const info = await response.json() as {
            name: string | null;
            tag: string | null;
        };

        system.name = info.name;
        system.tag = info.tag;
    } catch (error) {
        // Keep the old tag so names don't flicker during an outage
        console.error("System refresh failed:", error);
    }
}
