/* tests/fixtures.ts */

import type { Member } from "../src/proxy/types.ts";

export function member(
    id: string,
    prefix: string | null = null,
    suffix: string | null = null,
): Member {
    return {
        id,
        name: id,
        display_name: null,
        avatar_url: null,
        webhook_avatar_url: null,
        proxy_tags: [{ prefix, suffix }],
        keep_proxy: false,
        autoproxy_enabled: null,
    };
}
