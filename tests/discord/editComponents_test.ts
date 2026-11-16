/* tests/discord/editComponents_test.ts */

import { assertEquals } from "@std/assert";
import { ComponentType, replaceText } from "../../src/discord/editComponents.ts";

const cdn = "https://cdn.discordapp.com/attachments/1/2";

const sent = [
    {
        type: ComponentType.TextDisplay,
        id: 1,
        content: "old",
    },
    {
        type: ComponentType.ActionRow,
        id: 2,
        components: [],
    },
    {
        type: ComponentType.MediaGallery,
        id: 3,
        items: [
            {
                media: {
                    url: `${cdn}/0-cat.png?ex=abc`,
                    proxy_url: "x",
                },
                spoiler: true,
            },
        ],
    },
    {
        type: ComponentType.File,
        id: 4,
        file: {
            url: `${cdn}/1-notes%20v2.txt`,
        },
    },
];

const names = ["0-cat.png", "1-notes v2.txt"];

Deno.test("new text replaces the old and goes first", () => {
    const edited = replaceText(sent, "new", names);

    assertEquals(edited[0], {
        type: ComponentType.TextDisplay,
        content: "new",
    });
    assertEquals(edited.length, 4);
});

Deno.test("attachments point back at attachment:// and keep spoilers", () => {
    const edited = replaceText(sent, "new", names);

    assertEquals(edited[2].items[0], {
        media: {
            url: "attachment://0-cat.png",
        },
        spoiler: true,
    });
    assertEquals(edited[3].file.url, "attachment://1-notes v2.txt");
});

Deno.test("empty text drops the text block", () => {
    const edited = replaceText(sent, "", names);

    assertEquals(
        edited.some((component) => component.type === ComponentType.TextDisplay),
        false,
    );
});
