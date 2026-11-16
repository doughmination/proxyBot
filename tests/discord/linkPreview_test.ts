/* tests/discord/linkPreview_test.ts */

import { assertEquals } from "@std/assert";
import { wantsLinkPreview } from "../../src/discord/linkPreview.ts";

Deno.test("plain link wants a preview", () => {
    assertEquals(wantsLinkPreview("look https://example.com"), true);
});

Deno.test("text without a link doesn't", () => {
    assertEquals(wantsLinkPreview("just words"), false);
});

Deno.test("angle-bracket link stays hidden", () => {
    assertEquals(wantsLinkPreview("<https://example.com>"), false);
});

Deno.test("over 2000 chars stays components v2", () => {
    assertEquals(wantsLinkPreview(`https://example.com ${"a".repeat(2000)}`), false);
});
