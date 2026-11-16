/* src/proxy/types.ts */

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
    autoproxy_enabled: boolean | null;
}

export interface ProxyMatch {
    members: Member[];
    content: string;
}
