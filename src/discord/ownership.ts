/* src/discord/ownership.ts */

import type { Message, PartialMessage } from "discord.js";

import { client } from "./client.ts";

// Webhooks the bot created stamp its application id on every message they send
export function isProxied(message: Message | PartialMessage): boolean {
    return Boolean(message.webhookId)
        && message.applicationId !== null
        && message.applicationId === client.application?.id;
}
