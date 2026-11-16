/* src/discord/client.ts */

import { Client, GatewayIntentBits, Partials } from "discord.js";

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    // Lets ❌ and ❓ work on messages sent before the bot last started
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
    ],
});
