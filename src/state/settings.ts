/* src/state/settings.ts */

// Resolved from this file, so it works whatever directory the service starts in
const settingsDir = new URL("../../data/", import.meta.url);
const settingsFile = new URL("settings.json", settingsDir);

export interface Settings {
    autoproxy: boolean;
}

const defaults: Settings = {
    autoproxy: true,
};

export const settings: Settings = { ...defaults };

export async function loadSettings(): Promise<void> {
    try {
        const saved = JSON.parse(await Deno.readTextFile(settingsFile));
        Object.assign(settings, saved);
    } catch (error) {
        // First run has no file yet; anything else is worth a log
        if (!(error instanceof Deno.errors.NotFound)) {
            console.error("Settings load failed, using defaults:", error);
        }
    }
}

export async function saveSettings(): Promise<void> {
    await Deno.mkdir(settingsDir, { recursive: true });
    await Deno.writeTextFile(settingsFile, JSON.stringify(settings, null, 4));
}
