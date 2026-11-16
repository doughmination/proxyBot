/* src/proxy/autoproxy.ts */

import { matchProxyTags } from "./tags.ts";
import type { Member, ProxyMatch } from "./types.ts";

// Tags win; otherwise everyone fronting speaks together. A leading "\" skips it
export function pickProxy(
    members: Member[],
    fronters: Member[],
    content: string,
): ProxyMatch | null {
    const tagged = matchProxyTags(members, content);
    if (tagged) return tagged;
    if (content.startsWith("\\")) return null;

    const speaking = fronters.filter(
        (member) => member.autoproxy_enabled !== false,
    );
    if (speaking.length === 0) return null;

    return {
        members: speaking,
        content,
    };
}
