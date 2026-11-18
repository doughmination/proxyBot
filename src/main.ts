/* src/main.ts */

import { Events } from "discord.js";

import { fetchFronters } from "./api/fronters.ts";
import { refreshMembers } from "./api/members.ts";
import { refreshSystem } from "./api/system.ts";
import { connectLive } from "./api/live.ts";
import { memberRefreshMs } from "./config/constants.ts";
import { discordToken, ownerUserId } from "./config/env.ts";
import { client } from "./discord/client.ts";
import { proxyMessage } from "./discord/proxyMessage.ts";
import { handleReaction } from "./discord/reactions.ts";
import { notifyReply } from "./discord/replyNotice.ts";
import { updateStatus } from "./discord/status.ts";
import { markActive } from "./state/activity.ts";
import {
    addGuild,
    loadSettings,
    removeGuild,
    syncGuilds,
} from "./state/settings.ts";

client.once(Events.ClientReady, (ready) => {
    console.log(`Logged in as ${ready.user.tag}`);
    updateStatus();

    syncGuilds(ready.guilds.cache.keys()).catch((error) => {
        console.error("Guild sync failed:", error);
    });
});

client.on(Events.GuildCreate, (guild) => {
    addGuild(guild.id).catch((error) => {
        console.error("Guild add failed:", error);
    });
});

client.on(Events.GuildDelete, (guild) => {
    // An outage also fires this; only a real leave or kick drops the settings
    if (!guild.available) return;

    removeGuild(guild.id).catch((error) => {
        console.error("Guild remove failed:", error);
    });
});

client.on(Events.MessageCreate, (message) => {
    if (message.author.id === ownerUserId) markActive(message.channelId);

    proxyMessage(message).catch((error) => {
        console.error("Proxy failed:", error);
    });

    notifyReply(message).catch((error) => {
        console.error("Reply notice failed:", error);
    });
});

client.on(Events.MessageReactionAdd, (reaction, user) => {
    if (user.id === ownerUserId) markActive(reaction.message.channelId);

    handleReaction(reaction, user).catch((error) => {
        console.error("Reaction failed:", error);
    });
});

client.on(Events.TypingStart, (typing) => {
    if (typing.user.id === ownerUserId) markActive(typing.channel.id);
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
