/* src/proxy/types.ts */

export interface ProxyTag {
    prefix: string | null;
    suffix: string | null;
}

export interface MemberStatus {
    text: string;
    emoji: string | null;
}

export interface Member {
    id: string;
    name: string;
    display_name: string | null;
    pronouns: string | null;
    color: string | null;
    description: string | null;
    tags?: string[];
    pride?: string[];
    status?: MemberStatus | null;
    avatar_url: string | null;
    webhook_avatar_url: string | null;
    proxy_tags: ProxyTag[];
    keep_proxy: boolean;
    autoproxy_enabled: boolean | null;
}

export interface ProxyMatch {
    members: Member[];
    content: string;
}
