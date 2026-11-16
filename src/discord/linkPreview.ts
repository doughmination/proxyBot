/* src/discord/linkPreview.ts */

// Normal webhook messages cap content at 2000; Text Display allows 4000
const classicContentLimit = 2000;

// <https://...> is Discord's own way to hide a preview, so it doesn't count
const previewableLink = /(^|[^<])https?:\/\/\S/;

// Components v2 messages never get link previews, so links go out as normal messages
export function wantsLinkPreview(content: string): boolean {
    return content.length <= classicContentLimit && previewableLink.test(content);
}
