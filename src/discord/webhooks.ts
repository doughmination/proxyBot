/* src/discord/webhooks.ts */

import type { Message, Webhook } from "discord.js";

import { webhookDefaultName } from "../config/constants.ts";
import { client } from "./client.ts";

const webhooks = new Map<string, Webhook>();

// Threads can't own webhooks, so they borrow the parent channel's
export async function getWebhook(message: Message): Promise<Webhook | null> {
    const channel = message.channel.isThread()
        ? message.channel.parent
        : message.channel;

    if (!channel || !("fetchWebhooks" in channel)) return null;

    const cached = webhooks.get(channel.id);
    if (cached) return cached;

    const existing = await channel.fetchWebhooks();
    const webhook = existing.find(
        (hook) => hook.owner?.id === client.user?.id,
    ) ?? await channel.createWebhook({
        name: webhookDefaultName,
    });

    webhooks.set(channel.id, webhook);
    return webhook;
}
