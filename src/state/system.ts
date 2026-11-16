/* src/state/system.ts */

import type { Member } from "../proxy/types.ts";

// Last known data from the site, kept through outages
export const system: {
    name: string | null;
    tag: string | null;
    members: Member[];
    fronters: Member[];
} = {
    name: null,
    tag: null,
    members: [],
    fronters: [],
};
