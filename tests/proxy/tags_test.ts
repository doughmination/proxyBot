/* tests/proxy/tags_test.ts */

import { assertEquals } from "@std/assert";

import { matchProxyTags } from "../../src/proxy/tags.ts";
import { member } from "../fixtures.ts";

const members = [
    member("short", "C:"),
    member("long", "C1:"),
    member("brackets", "[", "]"),
];

Deno.test("prefix match strips the tag", () => {
    assertEquals(matchProxyTags(members, "C: hi")?.content, "hi");
});

Deno.test("longest tag wins", () => {
    assertEquals(matchProxyTags(members, "C1: hi")?.members[0].id, "long");
});

Deno.test("prefix and suffix match", () => {
    const match = matchProxyTags(members, "[hello]");

    assertEquals(match?.members[0].id, "brackets");
    assertEquals(match?.content, "hello");
});

Deno.test("no tag means no match", () => {
    assertEquals(matchProxyTags(members, "plain message"), null);
});
