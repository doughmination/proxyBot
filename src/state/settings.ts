/* src/state/settings.ts */

import { dump, load } from "jpcl-lang";

// Resolved from this file, so it works whatever directory the service starts in
const settingsFile = new URL("../../data/settings.jp", import.meta.url);

// One [guildId] section per server in the .jp file
export interface GuildSettings {
    autoproxy: {
        enabled: boolean;
    };
}

const defaults: GuildSettings = {
    autoproxy: {
        enabled: false,
    },
};

// One entry per server the bot is in
export const settings: Record<string, GuildSettings> = {};

// Merge per section, so keys added later keep their defaults
function withDefaults(saved: Partial<GuildSettings> = {}): GuildSettings {
    return {
        autoproxy: {
            ...defaults.autoproxy,
            ...saved.autoproxy,
        },
    };
}

// Returns the stored entry, creating it, so edits are kept by saveSettings
export function guildSettings(guildId: string): GuildSettings {
    settings[guildId] ??= withDefaults();
    return settings[guildId];
}

// Adds servers joined and drops servers left, including while the bot was offline
export async function syncGuilds(guildIds: Iterable<string>): Promise<void> {
    const current = new Set(guildIds);
    let changed = false;

    for (const guildId of current) {
        if (settings[guildId]) continue;
        settings[guildId] = withDefaults();
        changed = true;
    }

    for (const guildId of Object.keys(settings)) {
        if (current.has(guildId)) continue;
        delete settings[guildId];
        changed = true;
    }

    if (changed) await saveSettings();
}

export async function addGuild(guildId: string): Promise<void> {
    guildSettings(guildId);
    await saveSettings();
}

export async function removeGuild(guildId: string): Promise<void> {
    delete settings[guildId];
    await saveSettings();
}

export async function loadSettings(): Promise<void> {
    try {
        const saved = await load(settingsFile) as Record<string, Partial<GuildSettings>>;

        for (const [guildId, guild] of Object.entries(saved)) {
            // Skips leftovers from the old global format, like [autoproxy]
            if (!/^\d+$/.test(guildId)) continue;
            settings[guildId] = withDefaults(guild);
        }
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
