/* src/discord/layout.ts */

import {
    ActionRowBuilder,
    type AttachmentPayload,
    ButtonBuilder,
    ButtonStyle,
    FileBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageReferenceType,
    TextDisplayBuilder,
    type Message,
    type MessageActionRowComponentBuilder,
} from "discord.js";

type TopLevelComponent =
    | TextDisplayBuilder
    | ActionRowBuilder<MessageActionRowComponentBuilder>
    | MediaGalleryBuilder
    | FileBuilder;

export interface Layout {
    components: TopLevelComponent[];
    files: AttachmentPayload[];
}

// Webhooks can't truly reply, so link back with a button instead
async function replyButton(message: Message): Promise<ButtonBuilder | null> {
    if (message.reference?.type !== MessageReferenceType.Default) return null;

    const original = await message.fetchReference().catch(() => null);
    if (!original) return null;

    const name = original.member?.displayName ?? original.author.displayName;

    return new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(`↪ ${name}`.slice(0, 80))
        .setURL(original.url);
}

// Components v2 only shows attachments that a component points at.
// Classic: the text goes in content and files show as plain attachments
export async function buildLayout(
    message: Message,
    content: string,
    classic: boolean,
): Promise<Layout> {
    const components: TopLevelComponent[] = [];
    const files: AttachmentPayload[] = [];
    const button = await replyButton(message);

    if (content && !classic) {
        components.push(new TextDisplayBuilder().setContent(content));
    }

    // Own row under the text; a Section accessory sits beside it and looks wrong
    if (button) {
        components.push(
            new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(button),
        );
    }

    const gallery = new MediaGalleryBuilder();
    const otherFiles: FileBuilder[] = [];

    for (const [index, attachment] of [...message.attachments.values()].entries()) {
        // attachment:// must match Discord's sanitised filename exactly
        const name = `${index}-${attachment.name.replace(/[^\w.-]/g, "_")}`;
        const type = attachment.contentType ?? "";

        // Classic attachments carry the spoiler in the filename instead
        files.push({
            attachment: attachment.url,
            name: classic && attachment.spoiler ? `SPOILER_${name}` : name,
        });

        if (classic) continue;

        if (type.startsWith("image/") || type.startsWith("video/")) {
            gallery.addItems(
                new MediaGalleryItemBuilder()
                    .setURL(`attachment://${name}`)
                    .setSpoiler(attachment.spoiler),
            );
        } else {
            otherFiles.push(
                new FileBuilder()
                    .setURL(`attachment://${name}`)
                    .setSpoiler(attachment.spoiler),
            );
        }
    }

    if (gallery.items.length > 0) components.push(gallery);
    components.push(...otherFiles);

    return {
        components,
        files,
    };
}
