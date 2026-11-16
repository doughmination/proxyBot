/* tests/proxy/names_test.ts */

import { assertEquals } from "@std/assert";

import { frontingStatus, webhookName } from "../../src/proxy/names.ts";
import { member } from "../fixtures.ts";

const host = {
    ...member("c1"),
    display_name: "Clove (Host)",
};

Deno.test("webhook name joins co-fronters", () => {
    assertEquals(webhookName([host, member("02")], null), "Clove (Host) & 02");
});

Deno.test("more than three speakers collapse to a count", () => {
    const crowd = ["a", "b", "c", "d", "e"].map((id) => member(id));

    assertEquals(webhookName(crowd, null), "a, b, c & 2 more");
});

Deno.test("three speakers use commas then &", () => {
    const trio = ["a", "b", "c"].map((id) => member(id));

    assertEquals(webhookName(trio, null), "a, b & c");
});

Deno.test("system tag goes on the end and always survives", () => {
    const longName = {
        ...member("x"),
        display_name: "n".repeat(100),
    };
    const name = webhookName([longName], "TAG");

    assertEquals(name.length, 80);
    assertEquals(name.endsWith(" TAG"), true);
});

Deno.test("webhook name dodges the discord ban", () => {
    const named = {
        ...member("x"),
        display_name: "Discord fan",
    };

    assertEquals(webhookName([named], null), "dïscord fan");
});

Deno.test("fronting status lists display names", () => {
    assertEquals(
        frontingStatus([host, member("02")]),
        "Fronting: Clove (Host), 02",
    );
    assertEquals(frontingStatus([]), "Nobody fronting");
});
