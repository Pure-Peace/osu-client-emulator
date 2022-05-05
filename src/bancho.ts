import fetch, { RequestInit } from "node-fetch";
import { osuWeb, OsuMultipart, headers, agent } from "./utils.js";

export class BanchoClient {
    username: string;
    password: string;

    debug: boolean;

    constructor(username: string, password: string, options = { debug: false }) {
        this.username = username
        this.password = password
        this.debug = options.debug
    }

    log(message?: any, ...optionalParams: any[]) {
        console.log(`BanchoClient <${this.username}>: `, message, ...optionalParams)
    }

    async fetchOsuWeb(path: string, init?: RequestInit) {
        console.log(`requesting ${path}...`);
        const resp = await fetch(osuWeb(path), init)
        console.log(`${path} request done.`)
        return resp
    }

    async osuSession(action = "check") {
        const response = await this.fetchOsuWeb("osu-session.php", {
            method: "POST",
            body: new OsuMultipart()
                .addDict({
                    'name="u"': this.username,
                    'name="h"': this.password,
                    'name="action"': action,
                })
                .build(),
            headers: headers({ isMultipart: true }),
            agent: agent(),
        });
        if (response.status !== 200) throw new Error(await response.text());
    }
}

