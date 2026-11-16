/* tests/state/activity_test.ts */

import { assertEquals } from "@std/assert";

import { awayAfterMs, isActive, markActive } from "../../src/state/activity.ts";

Deno.test("never seen in a channel means away", () => {
    assertEquals(isActive("never"), false);
});

Deno.test("recent activity counts, old activity doesn't", () => {
    markActive("chat", 1000);

    assertEquals(isActive("chat", 1000 + awayAfterMs - 1), true);
    assertEquals(isActive("chat", 1000 + awayAfterMs), false);
});

Deno.test("activity is per channel", () => {
    markActive("general", 1000);

    assertEquals(isActive("art", 1000), false);
});
