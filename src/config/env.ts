/* src/config/env.ts */

const token = Deno.env.get("DISCORD_TOKEN");
const ownerId = Deno.env.get("OWNER_ID");

if (!token || !ownerId) {
    throw new Error("Set DISCORD_TOKEN and OWNER_ID in .env");
}

export const discordToken: string = token;
export const ownerUserId: string = ownerId;

// Optional: without it everything works except d!switch
export const siteToken: string | undefined = Deno.env.get("SITE_TOKEN");
