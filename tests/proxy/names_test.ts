/* tests/proxy/names_test.ts */

import { assertEquals } from "@std/assert";

import { frontingStatus, webhookName } from "../../src/proxy/names.ts";
import { member } from "../fixtures.ts";

const host = {
    ...member("c1"),
    display_name: "Clove (Host)",
};

Deno.test("webhook name joins co-fronters", () => {
    assertEquals(webhookName([host, member("02")]), "Clove (Host) & 02");
});

Deno.test("webhook name dodges the discord ban", () => {
    const named = {
        ...member("x"),
        display_name: "Discord fan",
    };

    assertEquals(webhookName([named]), "dïscord fan");
});

Deno.test("fronting status lists display names", () => {
    assertEquals(
        frontingStatus([host, member("02")]),
        "Fronting: Clove (Host), 02",
    );
    assertEquals(frontingStatus([]), "Nobody fronting");
});
