/* tests/proxy/autoproxy_test.ts */

import { assertEquals } from "@std/assert";

import { pickProxy } from "../../src/proxy/autoproxy.ts";
import { member } from "../fixtures.ts";

const tagged = member("tagged", "T:");
const host = member("host");
const quiet = {
    ...member("quiet"),
    autoproxy_enabled: false,
};

Deno.test("tags beat autoproxy", () => {
    const match = pickProxy([tagged], [host], "T: hi");

    assertEquals(match?.members.map((speaker) => speaker.id), ["tagged"]);
});

Deno.test("untagged messages go to everyone fronting", () => {
    const match = pickProxy([tagged], [host, member("co")], "hi");

    assertEquals(match?.members.map((speaker) => speaker.id), ["host", "co"]);
    assertEquals(match?.content, "hi");
});

Deno.test("members with autoproxy off are left out", () => {
    const match = pickProxy([], [host, quiet], "hi");

    assertEquals(match?.members.map((speaker) => speaker.id), ["host"]);
});

Deno.test("backslash skips autoproxy", () => {
    assertEquals(pickProxy([], [host], "\\not proxied"), null);
});

Deno.test("nobody fronting means no proxy", () => {
    assertEquals(pickProxy([], [], "hi"), null);
});
