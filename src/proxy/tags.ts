/* src/proxy/tags.ts */

import type { Member, ProxyMatch } from "./types.ts";

// Case is ignored, and any whitespace matches any whitespace, so "ae hi" and a non-breaking space still hit "Ae "
function tagPattern(tag: string): string {
    return tag
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
}

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

            const found = new RegExp(
                `^${tagPattern(prefix)}([\\s\\S]*?)${tagPattern(suffix)}$`,
                "iu",
            ).exec(content);

            if (!found) continue;

            best = {
                members: [member],
                content: member.keep_proxy ? content : found[1].trim(),
            };
            bestLength = tagLength;
        }
    }

    return best;
}
