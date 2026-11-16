/* src/state/settings.ts */

import { dump, load } from "jpcl-lang";

// Resolved from this file, so it works whatever directory the service starts in
const settingsFile = new URL("../../data/settings.jp", import.meta.url);

// Each top-level key is a [section] in the .jp file
export interface Settings {
    autoproxy: {
        enabled: boolean;
    };
}

const defaults: Settings = {
    autoproxy: {
        enabled: true,
    },
};

export const settings: Settings = structuredClone(defaults);

export async function loadSettings(): Promise<void> {
    try {
        const saved = await load(settingsFile) as Partial<Settings>;

        // Merge per section, so keys added later keep their defaults
        settings.autoproxy = {
            ...defaults.autoproxy,
            ...saved.autoproxy,
        };
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
