/* src/proxy_test.ts */

import { assertEquals } from "@std/assert";
import {
    frontingStatus,
    matchProxyTags,
    webhookName,
    type Member,
} from "./proxy.ts";

function member(
    id: string,
    prefix: string | null,
    suffix: string | null,
): Member {
    return {
        id,
        name: id,
        display_name: null,
        avatar_url: null,
        webhook_avatar_url: null,
        proxy_tags: [{ prefix, suffix }],
        keep_proxy: false,
    };
}

const members = [
    member("short", "C:", null),
    member("long", "C1:", null),
    member("brackets", "[", "]"),
];

Deno.test("prefix match strips the tag", () => {
    assertEquals(matchProxyTags(members, "C: hi")?.content, "hi");
});

Deno.test("longest tag wins", () => {
    assertEquals(matchProxyTags(members, "C1: hi")?.member.id, "long");
});

Deno.test("prefix and suffix match", () => {
    const match = matchProxyTags(members, "[hello]");

    assertEquals(match?.member.id, "brackets");
    assertEquals(match?.content, "hello");
});

Deno.test("no tag means no match", () => {
    assertEquals(matchProxyTags(members, "plain message"), null);
});

Deno.test("webhook name dodges the discord ban", () => {
    const named = {
        ...member("x", null, null),
        display_name: "Discord fan",
    };

    assertEquals(webhookName(named), "dïscord fan");
});

Deno.test("fronting status lists display names", () => {
    const host = {
        ...member("c1", null, null),
        display_name: "Clove (Host)",
    };

    assertEquals(
        frontingStatus([host, member("02", null, null)]),
        "Fronting: Clove (Host), 02",
    );
    assertEquals(frontingStatus([]), "Nobody fronting");
});
