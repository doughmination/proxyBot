/* src/discord/editComponents.ts */

// Discord's component type numbers; importing discord.js here would make tests need env access
export const ComponentType = {
    ActionRow: 1,
    Button: 2,
    Section: 9,
    TextDisplay: 10,
    Thumbnail: 11,
    MediaGallery: 12,
    File: 13,
    Separator: 14,
    Container: 17,
} as const;

// Loose JSON so the existing message's components can pass straight through
// deno-lint-ignore no-explicit-any
type ComponentJson = Record<string, any>;

// Discord hands back CDN URLs, but File components only accept attachment://
function toAttachmentUrl(url: string, attachmentNames: Set<string>): string {
    try {
        const name = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
        return attachmentNames.has(name) ? `attachment://${name}` : url;
    } catch {
        return url;
    }
}

function rewriteMedia(
    component: ComponentJson,
    attachmentNames: Set<string>,
): ComponentJson {
    if (component.type === ComponentType.MediaGallery) {
        return {
            ...component,
            items: component.items.map((item: ComponentJson) => ({
                ...item,
                media: {
                    url: toAttachmentUrl(item.media.url, attachmentNames),
                },
            })),
        };
    }

    if (component.type === ComponentType.File) {
        return {
            ...component,
            file: {
                url: toAttachmentUrl(component.file.url, attachmentNames),
            },
        };
    }

    return component;
}

// Swaps the text block for new text, keeping buttons and attachments as they were
export function replaceText(
    components: ComponentJson[],
    text: string,
    attachmentNames: string[],
): ComponentJson[] {
    const names = new Set(attachmentNames);
    const kept = components
        .filter((component) => component.type !== ComponentType.TextDisplay)
        .map((component) => rewriteMedia(component, names));

    if (!text) return kept;

    return [
        {
            type: ComponentType.TextDisplay,
            content: text,
        },
        ...kept,
    ];
}
