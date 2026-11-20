/* src/api/live.ts */

import { pingMs, reconnectMs, socketUrl } from "../config/constants.ts";
import type { Member } from "../proxy/types.ts";
import { fetchFronters, setFronters } from "./fronters.ts";
import { refreshMembers } from "./members.ts";

interface LiveEvent {
    type?: string;
    data?: {
        members?: Member[];
    };
}

function receive(raw: string): void {
    let event: LiveEvent;

    try {
        event = JSON.parse(raw);
    } catch {
        return;
    }

    if (event.type === "fronters_update" && event.data?.members) {
        setFronters(event.data.members);
    }

    // The site sends this after any member edit, so tags and avatars apply at once
    if (event.type === "members_update" || event.type === "force_refresh") {
        refreshMembers();
    }
}

// Same socket the website listens to; resync on every connect to cover missed events
export function connectLive(): void {
    const socket = new WebSocket(socketUrl);
    let awaitingPong = false;
    let pingTimer: ReturnType<typeof setInterval> | undefined;

    socket.onopen = () => {
        console.log("Live socket open");
        fetchFronters();

        pingTimer = setInterval(() => {
            if (awaitingPong) return socket.close();

            awaitingPong = true;
            socket.send("ping");
        }, pingMs);
    };

    socket.onmessage = (event) => {
        if (event.data === "pong") {
            awaitingPong = false;
            return;
        }

        receive(String(event.data));
    };

    socket.onclose = () => {
        clearInterval(pingTimer);
        console.log("Live socket closed, reconnecting");
        setTimeout(connectLive, reconnectMs);
    };
}
