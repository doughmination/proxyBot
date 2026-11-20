/* src/commands/ping.ts */

import type { Message } from "discord.js";

import { apiBase } from "../config/constants.ts";

// Round trip to the system site's API, or why it failed
async function apiPing(): Promise<string> {
    const started = performance.now();

    try {
        const response = await fetch(`${apiBase}/system`);
        await response.body?.cancel();
        const took = Math.round(performance.now() - started);

        return response.ok ? `${took} ms` : `HTTP ${response.status} after ${took} ms`;
    } catch (error) {
        return `failed (${error instanceof Error ? error.message : "unknown error"})`;
    }
}

function report(heartbeat: number, discord: number | null, api: string): string {
    return [
        "🏓 Pong!",
        `Discord heartbeat: ${heartbeat < 0 ? "not measured yet" : `${heartbeat} ms`}`,
        `Discord round trip: ${discord === null ? "measuring…" : `${discord} ms`}`,
        `System API: ${api}`,
    ].join("\n");
}

export async function pingCommand(message: Message): Promise<void> {
    const apiResult = apiPing();
    const heartbeat = message.client.ws.ping;

    // Send, then edit with the time the send took
    const started = performance.now();
    const reply = await message.reply(report(heartbeat, null, "measuring…"));
    const discord = Math.round(performance.now() - started);

    await reply.edit(report(heartbeat, discord, await apiResult));
}
