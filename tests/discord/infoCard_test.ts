/* tests/discord/infoCard_test.ts */

import { assert, assertEquals, assertStringIncludes } from "@std/assert";

import { ComponentType } from "../../src/discord/editComponents.ts";
import { buildInfoCard } from "../../src/discord/infoCard.ts";
import { member } from "../fixtures.ts";

const base = {
    username: "Webhook Name",
    avatarUrl: "https://cdn.example/avatar.png",
    messageUrl: "https://discord.com/channels/1/2/3",
    ownerId: "42",
    systemName: "Doughmination System",
};

// deno-lint-ignore no-explicit-any
function countComponents(components: any[]): number {
    return components.reduce((total, component) => {
        const children = [
            ...(component.components ?? []),
            ...(component.accessory ? [component.accessory] : []),
        ];
        return total + 1 + countComponents(children);
    }, 0);
}

Deno.test("member card shows site details in their colour", () => {
    const clove = {
        ...member("kzsbyo"),
        display_name: "Clove",
        pronouns: "fae/faer",
        color: "cba6f7",
        avatar_url: "https://site.example/clove.png",
        description: "Host",
        tags: ["Host"],
        pride: ["Transgender"],
        status: {
            text: "Coding again...",
            emoji: "💻",
        },
    };

    const [card] = buildInfoCard({
        ...base,
        members: [clove],
    });
    const text = JSON.stringify(card);

    assertEquals(card.accent_color, 0xcba6f7);
    assertEquals(card.components[0].type, ComponentType.Section);
    assertStringIncludes(text, "## Clove\\nfae/faer\\n💻 Coding again...");
    assertStringIncludes(text, "**Pride**\\nTransgender");
    assertStringIncludes(text, "https://doughmination.co.uk/kzsbyo");
});

Deno.test("member without avatar or details is plain text", () => {
    const [card] = buildInfoCard({
        ...base,
        members: [member("a")],
    });

    assertEquals(card.accent_color, 0xeb459e);
    assertEquals(card.components[0].type, ComponentType.TextDisplay);
});

Deno.test("unknown sender falls back to the webhook name", () => {
    const [card] = buildInfoCard({
        ...base,
        members: undefined,
    });

    assertStringIncludes(JSON.stringify(card), "## Webhook Name");
});

Deno.test("big front stays under 40 components and counts the rest", () => {
    const crowd = Array.from({ length: 10 }, (_, index) => ({
        ...member(`m${index}`),
        avatar_url: "https://site.example/a.png",
        description: "x".repeat(5000),
    }));

    const components = buildInfoCard({
        ...base,
        members: crowd,
    });

    assert(countComponents(components) <= 40);
    assertStringIncludes(JSON.stringify(components), "& 7 more");
});
