/* src/discord/replyCard.ts */

import { ComponentType } from "./editComponents.ts";
import {
    accentColour,
    type ComponentJson,
    header,
    linkButton,
    shorten,
} from "./infoCard.ts";

export interface ReplyCardInput {
    replierName: string;
    replierAvatarUrl: string;
    proxiedName: string;
    content: string;
    hasAttachments: boolean;
    replyUrl: string;
}

// Quote every line so a multi-line reply stays inside the quote
function quote(text: string): string {
    return text.split("\n").map((line) => `> ${line}`).join("\n");
}

export function buildReplyCard(input: ReplyCardInput): ComponentJson[] {
    const body = input.content
        ? quote(shorten(input.content))
        : "*Sent an attachment*";

    return [
        {
            type: ComponentType.Container,
            accent_color: accentColour,
            components: [
                header(
                    `### ↪ ${input.replierName} replied to ${input.proxiedName}\n${body}`,
                    input.replierAvatarUrl,
                ),
                {
                    type: ComponentType.ActionRow,
                    components: [
                        linkButton("Jump to reply", input.replyUrl),
                    ],
                },
            ],
        },
        ...(input.content && input.hasAttachments
            ? [
                {
                    type: ComponentType.TextDisplay,
                    content: "-# Also sent an attachment",
                },
            ]
            : []),
    ];
}
