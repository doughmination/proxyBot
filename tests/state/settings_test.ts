/* tests/state/settings_test.ts */

import { assertEquals } from "@std/assert";

import {
    guildSettings,
    setAutoproxyEverywhere,
    settings,
} from "../../src/state/settings.ts";

Deno.test("setAutoproxyEverywhere changes every server", () => {
    guildSettings("1").autoproxy.enabled = true;
    guildSettings("2");

    assertEquals(setAutoproxyEverywhere(false), 2);
    assertEquals(guildSettings("1").autoproxy.enabled, false);

    assertEquals(setAutoproxyEverywhere(true), 2);
    assertEquals(guildSettings("2").autoproxy.enabled, true);

    delete settings["1"];
    delete settings["2"];
});

Deno.test("autoproxy is per server and off by default", () => {
    guildSettings("1").autoproxy.enabled = true;

    assertEquals(guildSettings("1").autoproxy.enabled, true);
    assertEquals(guildSettings("2").autoproxy.enabled, false);

    // Leaves no test entries behind for other tests
    delete settings["1"];
    delete settings["2"];
});
