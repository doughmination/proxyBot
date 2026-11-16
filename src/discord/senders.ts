/* src/discord/senders.ts */

import type { Member } from "../proxy/types.ts";

// Keeps memory flat; older messages fall back to the webhook name
const maxRemembered = 1000;

// shortcut: in memory only, so ❓ on messages from before a restart shows just the name
const senders = new Map<string, Member[]>();

export function rememberSenders(messageId: string, members: Member[]): void {
    senders.set(messageId, members);

    if (senders.size > maxRemembered) {
        senders.delete(senders.keys().next().value!);
    }
}

export function sendersOf(messageId: string): Member[] | undefined {
    return senders.get(messageId);
}
