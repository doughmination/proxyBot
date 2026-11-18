/* tests/state/settings_test.ts */

import { assertEquals } from "@std/assert";

import { guildSettings, settings } from "../../src/state/settings.ts";

Deno.test("autoproxy is per server and off by default", () => {
    guildSettings("1").autoproxy.enabled = true;

    assertEquals(guildSettings("1").autoproxy.enabled, true);
    assertEquals(guildSettings("2").autoproxy.enabled, false);

    // Leaves no test entries behind for other tests
    delete settings["1"];
    delete settings["2"];
});
