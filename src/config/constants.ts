/* src/config/constants.ts */

export const apiBase = "https://doughmination.co.uk/api/plural";
export const socketUrl = "wss://doughmination.co.uk/api/plural/ws";

export const memberRefreshMs = 5 * 60 * 1000;
export const pingMs = 30 * 1000;
export const reconnectMs = 5 * 1000;

export const webhookDefaultName = "proxyBot";
export const mergedAvatarSize = 512;

// Too many faces for a merge, so a crowd gets the site's icon
export const crowdAvatarUrl = "https://doughmination.co.uk/favicon.png";
