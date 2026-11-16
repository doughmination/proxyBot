/* src/discord/infoCard.ts */

import { maxNamedSpeakers } from "../proxy/names.ts";
import type { Member } from "../proxy/types.ts";
import { ComponentType } from "./editComponents.ts";

// Same values the system site uses for its member pages and Discord embeds
const siteUrl = "https://doughmination.co.uk";
const accentColour = 0xeb459e;
const maxDescription = 1000;
const linkButtonStyle = 5;

// deno-lint-ignore no-explicit-any
type ComponentJson = Record<string, any>;

export interface InfoCardInput {
    members: Member[] | undefined;
    username: string;
    avatarUrl: string;
    messageUrl: string;
    ownerId: string;
    systemName: string | null;
}

// Discord wants an integer; unset or non-hex colours get the site accent
function colourOf(color: string | null): number {
    const hex = color?.trim().replace(/^#/, "") ?? "";
    const full = hex.length === 3
        ? hex.split("").map((digit) => digit + digit).join("")
        : hex;

    return /^[0-9a-fA-F]{6}$/.test(full) ? parseInt(full, 16) : accentColour;
}

function shorten(text: string): string {
    return text.length > maxDescription
        ? `${text.slice(0, maxDescription - 1)}…`
        : text;
}

function linkButton(label: string, url: string): ComponentJson {
    return {
        type: ComponentType.Button,
        style: linkButtonStyle,
        label,
        url,
    };
}

// A Section needs an accessory, so members without an avatar get plain text
function header(text: string, avatarUrl: string | null): ComponentJson {
    const display = {
        type: ComponentType.TextDisplay,
        content: text,
    };

    if (!avatarUrl) return display;

    return {
        type: ComponentType.Section,
        components: [display],
        accessory: {
            type: ComponentType.Thumbnail,
            media: {
                url: avatarUrl,
            },
        },
    };
}

// Mirrors the site's member page: name, pronouns, status, then about, tags, pride
function memberCard(member: Member): ComponentJson {
    const top = [`## ${member.display_name || member.name}`];
    if (member.pronouns) top.push(member.pronouns);
    if (member.status) {
        top.push(`${member.status.emoji ?? ""} ${member.status.text}`.trim());
    }

    const details: string[] = [];
    if (member.description) details.push(`**About**\n${shorten(member.description)}`);
    if (member.tags?.length) details.push(`**Tags**\n${member.tags.join(", ")}`);
    if (member.pride?.length) details.push(`**Pride**\n${member.pride.join(", ")}`);

    const components = [header(top.join("\n"), member.avatar_url)];

    if (details.length > 0) {
        components.push(
            {
                type: ComponentType.Separator,
            },
            {
                type: ComponentType.TextDisplay,
                content: details.join("\n\n"),
            },
        );
    }

    components.push({
        type: ComponentType.ActionRow,
        components: [
            linkButton("Open page", `${siteUrl}/${encodeURIComponent(member.id)}`),
        ],
    });

    return {
        type: ComponentType.Container,
        accent_color: colourOf(member.color),
        components,
    };
}

// Messages from before a restart only have the webhook's name and avatar
function unknownCard(username: string, avatarUrl: string): ComponentJson {
    return {
        type: ComponentType.Container,
        accent_color: accentColour,
        components: [header(`## ${username}`, avatarUrl)],
    };
}

// Capped like the proxy names, which keeps it under Discord's 40 component limit
export function buildInfoCard(input: InfoCardInput): ComponentJson[] {
    const shown = input.members?.slice(0, maxNamedSpeakers);
    const hidden = (input.members?.length ?? 0) - (shown?.length ?? 0);

    const cards = shown
        ? shown.map(memberCard)
        : [unknownCard(input.username, input.avatarUrl)];

    const footer = [`Sent by <@${input.ownerId}>`];
    if (input.systemName) footer.push(input.systemName);
    if (hidden > 0) footer.unshift(`& ${hidden} more`);

    return [
        ...cards,
        {
            type: ComponentType.TextDisplay,
            content: `-# ${footer.join(" · ")}`,
        },
        {
            type: ComponentType.ActionRow,
            components: [
                linkButton("Jump to message", input.messageUrl),
            ],
        },
    ];
}
