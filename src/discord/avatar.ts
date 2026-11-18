/* src/discord/avatar.ts */

import { Buffer } from "node:buffer";
import type { Webhook } from "discord.js";

import { crowdAvatarUrl } from "../config/constants.ts";
import { avatarOf, mergeAvatars } from "../images/merge.ts";
import { maxNamedSpeakers } from "../proxy/names.ts";
import type { Member } from "../proxy/types.ts";
import { client } from "./client.ts";

// Which front each webhook's own avatar was merged for, by webhook id
const webhookAvatarKeys = new Map<string, string>();
// Held as a promise, so a merge started on front change is reused by the next message
let mergedAvatar: { key: string; png: Promise<Uint8Array | null> } | null = null;

function speakerKey(speakers: Member[]): string {
    return speakers.map((member) => member.id).join(",");
}

function mergedPng(speakers: Member[], key: string): Promise<Uint8Array | null> {
    if (mergedAvatar?.key !== key) {
        mergedAvatar = {
            key,
            png: mergeAvatars(speakers),
        };
    }

    return mergedAvatar.png;
}

// Drops a failed merge so the next message retries it
function forgetMerge(key: string): void {
    if (mergedAvatar?.key === key) mergedAvatar = null;
}

// Starts the download and merge as soon as the front changes, off the message path
export function premergeAvatar(speakers: Member[]): void {
    if (speakers.length < 2 || speakers.length > maxNamedSpeakers) return;

    const key = speakerKey(speakers);
    mergedPng(speakers, key).catch((error) => {
        console.error("Avatar premerge failed:", error);
        forgetMerge(key);
    });
}

// One member: per-message avatar URL. Several: the webhook's own avatar becomes the merge
export async function avatarFor(
    webhook: Webhook,
    speakers: Member[],
): Promise<string | undefined> {
    const botAvatar = client.user?.displayAvatarURL();

    if (speakers.length === 1) {
        return avatarOf(speakers[0]) ?? botAvatar;
    }

    if (speakers.length > maxNamedSpeakers) return crowdAvatarUrl;

    const key = speakerKey(speakers);
    if (webhookAvatarKeys.get(webhook.id) === key) return undefined;

    try {
        const png = await mergedPng(speakers, key);
        if (!png) return botAvatar;

        await webhook.edit({
            avatar: Buffer.from(png),
        });
        webhookAvatarKeys.set(webhook.id, key);
        return undefined;
    } catch (error) {
        // A broken merge shouldn't stop the message going out
        console.error("Avatar merge failed:", error);
        forgetMerge(key);
        return botAvatar;
    }
}
