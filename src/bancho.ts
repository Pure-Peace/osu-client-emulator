import fetch, { RequestInit } from "node-fetch";
import { RequestOptions } from "node:http";
import { OsuMultipart, headers, Instant } from "./utils.js";
import { URL } from 'url';
import chalk from 'chalk';
import dayjs from 'dayjs';


export type Agent = RequestOptions['agent'] | ((parsedUrl: URL) => RequestOptions['agent']);

export class BanchoClient {
    uri: URL;
    username: string;
    password: string;

    debug: boolean;
    agent?: Agent;

    errors: number = 0;
    logFormat: string = 'YYYY-MM-DD HH:mm:ss';

    constructor(config: { uri: URL | string; username: string, password: string }, options: { debug?: boolean, agent?: Agent }) {
        this.uri = (config.uri instanceof URL) ? config.uri : new URL(config.uri)
        this.username = config.username
        this.password = config.password

        this.debug = options.debug ?? false
        this.agent = options.agent
    }

    log(message?: any, ...optionalParams: any[]) {
        console.log(`[${dayjs().format(this.logFormat)}] ${chalk.green('BanchoClient')} <${chalk.blueBright(this.uri.hostname)}.${chalk.yellow(this.username)}>:`, message, ...optionalParams)
    }

    async fetchOsuWeb(path: string, init?: RequestInit) {
        this.log(`requesting ${chalk.yellow(path)}...`);
        const start = Instant.now()
        const resp = await fetch(`${this.uri.origin}/web/${path}`, init)
        this.log(`<${chalk.red(resp.status)}> ${chalk.yellow(path)} request done in ${chalk.red(start.elapsed().human)}.`)
        if (resp.status !== 200) {
            this.errors++;
            throw new Error(chalk.red(await resp.text()));
        }
        return resp
    }

    async osuSession(action = "check") {
        return await this.fetchOsuWeb("osu-session.php", {
            method: "POST",
            body: new OsuMultipart()
                .addDict({
                    'name="u"': this.username,
                    'name="h"': this.password,
                    'name="action"': action,
                })
                .build(),
            headers: headers({ isMultipart: true }),
            agent: this.agent,
        });
    }
}

