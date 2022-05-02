import fetch from "node-fetch";
import { osuWeb, OsuMultipart, headers, agent } from "./utils.js";


export async function osuSession(username: string, passwordMd5: string, action = "check") {
    console.log("requesting osu-session...");
    const response = await fetch(osuWeb("osu-session.php"), {
        method: "POST",
        body: new OsuMultipart()
            .addDict({
                'name="u"': username,
                'name="h"': passwordMd5,
                'name="action"': action,
            })
            .build(),
        headers: headers({ isMultipart: true }),
        agent: agent(),
    });
    if (response.status !== 200) throw new Error(await response.text());
    console.log("osu-session request done.");
}

