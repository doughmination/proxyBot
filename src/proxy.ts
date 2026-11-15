/* src/proxy.ts */

export interface ProxyTag {
    prefix: string | null;
    suffix: string | null;
}

export interface Member {
    id: string;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    webhook_avatar_url: string | null;
    proxy_tags: ProxyTag[];
    keep_proxy: boolean;
}

export interface ProxyMatch {
    member: Member;
    content: string;
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
            if (content.length < tagLength) continue;
            if (!content.startsWith(prefix)) continue;
            if (!content.endsWith(suffix)) continue;

            const inner = content.slice(
                prefix.length,
                content.length - suffix.length,
            );

            best = {
                member,
                content: member.keep_proxy ? content : inner.trim(),
            };
            bestLength = tagLength;
        }
    }

    return best;
}

// Custom status text is capped at 128 chars
export function frontingStatus(fronters: Member[]): string {
    if (fronters.length === 0) return "Nobody fronting";

    const names = fronters.map((member) => member.display_name ?? member.name);
    return `Fronting: ${names.join(", ")}`.slice(0, 128);
}

// Discord rejects webhook names over 80 chars or containing "discord"
export function webhookName(member: Member): string {
    const name = member.display_name ?? member.name;
    return name.replace(/discord/gi, "dïscord").slice(0, 80);
}
