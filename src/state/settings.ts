/* src/state/settings.ts */

import { dump, load } from "jpcl-lang";

// Resolved from this file, so it works whatever directory the service starts in
const settingsFile = new URL("../../data/settings.jp", import.meta.url);

export interface Settings {
    autoproxy: boolean;
}

const defaults: Settings = {
    autoproxy: true,
};

export const settings: Settings = { ...defaults };

export async function loadSettings(): Promise<void> {
    try {
        Object.assign(settings, await load(settingsFile));
    } catch (error) {
        // First run has no file yet; anything else is worth a log
        if ((error as { code?: string }).code !== "ENOENT") {
            console.error("Settings load failed, using defaults:", error);
        }
    }
}

export async function saveSettings(): Promise<void> {
    // dump creates data/ and writes atomically
    await dump(settings, settingsFile, { indent: 4 });
}
