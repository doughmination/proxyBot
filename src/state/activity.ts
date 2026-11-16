/* src/state/activity.ts */

// No sign of the owner in a channel for this long counts as away from it
export const awayAfterMs = 5 * 60 * 1000;

// Last time the owner typed, sent or reacted, by channel id
const lastSeen = new Map<string, number>();

export function markActive(channelId: string, now = Date.now()): void {
    lastSeen.set(channelId, now);
}

export function isActive(channelId: string, now = Date.now()): boolean {
    const seen = lastSeen.get(channelId);
    return seen !== undefined && now - seen < awayAfterMs;
}
