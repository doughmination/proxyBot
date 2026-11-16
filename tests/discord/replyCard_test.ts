/* tests/discord/replyCard_test.ts */

import { assertEquals, assertStringIncludes } from "@std/assert";

import { buildReplyCard } from "../../src/discord/replyCard.ts";

const base = {
    replierName: "Ari",
    replierAvatarUrl: "https://cdn.example/ari.png",
    proxiedName: "Clove ~ 🌙",
    content: "",
    hasAttachments: false,
    replyUrl: "https://discord.com/channels/1/2/3",
};

Deno.test("reply text is quoted line by line", () => {
    const text = JSON.stringify(buildReplyCard({
        ...base,
        content: "hi\nthere",
    }));

    assertStringIncludes(text, "↪ Ari replied to Clove ~ 🌙\\n> hi\\n> there");
    assertStringIncludes(text, "https://discord.com/channels/1/2/3");
});

Deno.test("attachment-only reply says so", () => {
    const components = buildReplyCard({
        ...base,
        hasAttachments: true,
    });

    assertEquals(components.length, 1);
    assertStringIncludes(JSON.stringify(components), "*Sent an attachment*");
});

Deno.test("text plus attachment adds a note", () => {
    const components = buildReplyCard({
        ...base,
        content: "look",
        hasAttachments: true,
    });

    assertEquals(components.length, 2);
});
