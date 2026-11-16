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
let mergedAvatar: { key: string; png: Uint8Array } | null = null;

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

    const key = speakers.map((member) => member.id).join(",");
    if (webhookAvatarKeys.get(webhook.id) === key) return undefined;

    try {
        if (mergedAvatar?.key !== key) {
            const png = await mergeAvatars(speakers);
            if (!png) return botAvatar;

            mergedAvatar = {
                key,
                png,
            };
        }

        await webhook.edit({
            avatar: Buffer.from(mergedAvatar.png),
        });
        webhookAvatarKeys.set(webhook.id, key);
        return undefined;
    } catch (error) {
        // A broken merge shouldn't stop the message going out
        console.error("Avatar merge failed:", error);
        return botAvatar;
    }
}
