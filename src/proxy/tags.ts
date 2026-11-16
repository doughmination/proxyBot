/* src/proxy/tags.ts */

import type { Member, ProxyMatch } from "./types.ts";

// Longest tag wins, so "C1:" beats "C:"
export function matchProxyTags(
    members: Member[],
    content: string,
): ProxyMatch | null {
    let best: ProxyMatch | null = null;
    let bestLength = -1;

    for (const member of members) {
        for (const tag of member.proxy_tags) {
            const prefix = tag.prefix ?? "";
            const suffix = tag.suffix ?? "";
            const tagLength = prefix.length + suffix.length;

            if (tagLength === 0) continue;
            if (tagLength <= bestLength) continue;
            if (content.length < tagLength) continue;
            if (!content.startsWith(prefix)) continue;
            if (!content.endsWith(suffix)) continue;

            const inner = content.slice(
                prefix.length,
                content.length - suffix.length,
            );

            best = {
                members: [member],
                content: member.keep_proxy ? content : inner.trim(),
            };
            bestLength = tagLength;
        }
    }

    return best;
}
