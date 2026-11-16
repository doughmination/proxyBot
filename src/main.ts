/* src/main.ts */

import { Events } from "discord.js";

import { fetchFronters } from "./api/fronters.ts";
import { refreshMembers } from "./api/members.ts";
import { refreshSystem } from "./api/system.ts";
import { connectLive } from "./api/live.ts";
import { memberRefreshMs } from "./config/constants.ts";
import { discordToken } from "./config/env.ts";
import { client } from "./discord/client.ts";
import { proxyMessage } from "./discord/proxyMessage.ts";
import { handleReaction } from "./discord/reactions.ts";
import { updateStatus } from "./discord/status.ts";
import { loadSettings } from "./state/settings.ts";

client.once(Events.ClientReady, (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    updateStatus();
});

client.on(Events.MessageCreate, (message) => {
    proxyMessage(message).catch((error) => {
        console.error("Proxy failed:", error);
    });
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
    handleReaction(reaction, user).catch((error) => {
        console.error("Reaction failed:", error);
    });
});

await loadSettings();
await refreshSystem();
await refreshMembers();
setInterval(refreshSystem, memberRefreshMs);
setInterval(refreshMembers, memberRefreshMs);

// The site doesn't retry failed broadcasts, so a slow poll catches anything missed
setInterval(fetchFronters, memberRefreshMs);
connectLive();
await client.login(discordToken);
