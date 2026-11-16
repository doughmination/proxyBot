/* src/state/system.ts */

import type { Member } from "../proxy/types.ts";

// Last known data from the site, kept through outages
export const system: {
    members: Member[];
    fronters: Member[];
} = {
    members: [],
    fronters: [],
};
