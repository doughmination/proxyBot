/* src/api/switch.ts */

import { apiBase } from "../config/constants.ts";
import { siteToken } from "../config/env.ts";

// The new front comes back over the live socket, so nothing is set here.
// Returns an error to show, or null when the switch went through
export async function switchFront(memberIds: string[]): Promise<string | null> {
    if (!siteToken) return "Switching isn't set up. Add `SITE_TOKEN` to the bot's `.env`.";

    try {
        const response = await fetch(`${apiBase}/switch`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${siteToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                members: memberIds,
            }),
        });

        if (response.status === 401) return "The site rejected the bot's token. Check `SITE_TOKEN` matches `BOT_TOKEN`.";
        if (!response.ok) return `The site couldn't switch (HTTP ${response.status}).`;

        return null;
    } catch (error) {
        console.error("Switch failed:", error);
        return "Couldn't reach the site to switch.";
    }
}
