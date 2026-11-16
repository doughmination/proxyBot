/* src/discord/client.ts */

import { Client, GatewayIntentBits, Partials } from "discord.js";

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        // Typing counts as being in chat, so reply DMs hold off
        GatewayIntentBits.GuildMessageTyping,
    ],
    // Lets ❌ and ❓ work on messages sent before the bot last started
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
    ],
    // Command replies shouldn't ping whoever ran the command
    allowedMentions: {
        repliedUser: false,
    },
});
