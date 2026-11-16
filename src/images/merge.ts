/* src/images/merge.ts */

import { Image } from "imagescript";

import { mergedAvatarSize } from "../config/constants.ts";
import type { Member } from "../proxy/types.ts";

export function avatarOf(member: Member): string | null {
    return member.webhook_avatar_url ?? member.avatar_url;
}

// One vertical strip per member, left to right in front order
export async function mergeAvatars(members: Member[]): Promise<Uint8Array | null> {
    const size = mergedAvatarSize;
    const urls = members
        .map(avatarOf)
        .filter((url): url is string => url !== null);

    if (urls.length === 0) return null;

    const stripWidth = Math.floor(size / urls.length);
    const canvas = new Image(size, size);

    for (const [index, url] of urls.entries()) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Avatar ${url}: HTTP ${response.status}`);

        const decoded = await Image.decode(new Uint8Array(await response.arrayBuffer()));
        if (!(decoded instanceof Image)) continue;

        // Last strip takes the rounding remainder so there's no gap on the right
        const width = index === urls.length - 1
            ? size - stripWidth * index
            : stripWidth;

        canvas.composite(decoded.cover(width, size), stripWidth * index, 0);
    }

    return await canvas.encode();
}
