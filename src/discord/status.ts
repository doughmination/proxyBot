/* src/discord/status.ts */

import { ActivityType } from "discord.js";

import { frontingStatus } from "../proxy/names.ts";
import { system } from "../state/system.ts";
import { client } from "./client.ts";

// Safe to call before login; the ready handler calls it again
export function updateStatus(): void {
    if (!client.isReady()) return;

    client.user.setPresence({
        activities: [
            {
                name: "Custom Status",
                type: ActivityType.Custom,
                state: frontingStatus(system.fronters),
            },
        ],
    });
}
