/* tests/commands/parse_test.ts */

import { assertEquals } from "@std/assert";

import { parseCommand } from "../../src/commands/parse.ts";

Deno.test("parses name and args, case-insensitive", () => {
    assertEquals(parseCommand("D!AutoProxy  OFF"), {
        name: "autoproxy",
        args: ["off"],
    });
});

Deno.test("plain messages are not commands", () => {
    assertEquals(parseCommand("hello d!autoproxy"), null);
});

Deno.test("bare prefix is not a command", () => {
    assertEquals(parseCommand("d!   "), null);
});
