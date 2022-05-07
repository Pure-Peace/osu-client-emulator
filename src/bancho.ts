import fetch, { RequestInit } from "node-fetch";
import { RequestOptions } from "node:http";
import { OsuMultipart, headers, Instant, Query, lazyConstruct } from "./utils.js";
import { URL } from 'url';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { readFileSync } from "node:fs";


export type Agent = RequestOptions['agent'] | ((parsedUrl: URL) => RequestOptions['agent']);

export interface AccountConfigInterface {
    username: string;
    password_md5: string;
    client_version: string;
    client_path_md5: string;
    mac: string;
    mac_md5: string;
    uninstall_md5: string;
    disk_md5: string;
    donet_env: string[]
}

export class AccountConfig {
    readonly cfg: AccountConfigInterface;

    constructor(envPath: string) {
        this.cfg = JSON.parse(readFileSync(envPath).toString())
    }

    get(key: keyof AccountConfigInterface) {
        return this.cfg[key]
    }

    get username() {
        return this.cfg.username
    }

    get password() {
        return this.cfg.password_md5
    }

    get clientVersion() {
        return this.cfg.client_version
    }

    get dotnetEnv() {
        return this.cfg.donet_env.join('|')
    }

    get clientHashes() {
        return [this.cfg.client_path_md5, this.cfg.mac, this.cfg.mac_md5, this.cfg.uninstall_md5, this.cfg.disk_md5].join(':')
    }
}

export class BaseClient {
    uri: URL;
    cfg: AccountConfig;

    debug: boolean;
    agent?: Agent;

    errors: number = 0;
    logFormat: string = 'YYYY-MM-DD HH:mm:ss';

    constructor(init: { uri: URL | string; cfg: AccountConfig | string }, options: { debug?: boolean, agent?: Agent }) {
        this.uri = lazyConstruct(URL, init.uri)
        this.cfg = lazyConstruct(AccountConfig, init.cfg)

        this.debug = options.debug ?? false
        this.agent = options.agent
    }

    log(message?: any, ...optionalParams: any[]) {
        console.log(
            `[${dayjs().format(this.logFormat)}] ${chalk.green('BanchoClient')} <${chalk.blueBright(this.uri.hostname)}.${chalk.yellow(this.cfg.username)}>:`,
            message, ...optionalParams)
    }

    async fetchOsuWeb(req: { path: string, query?: Query }, init?: RequestInit) {
        this.log(`requesting ${chalk.yellow(req.path)}...`);
        const start = Instant.now()

        const resp = await fetch(
            `${this.uri.origin}/web/${req.path}${req.query && req.query.val}`,
            init
        )
        this.log(`<${chalk.red(resp.status)}> ${chalk.yellow(req.path)} request done in ${chalk.red(start.elapsed().human)}.`)

        if (resp.status !== 200) {
            this.errors++;
            throw new Error(chalk.red(await resp.text()));
        }
        return resp
    }

}


export class BanchoClient extends BaseClient {
    async osuSession(action = "check") {
        return await this.fetchOsuWeb({
            path: "osu-session.php"
        }, {
            method: "POST",
            body: new OsuMultipart({
                'name="u"': this.cfg.username,
                'name="h"': this.cfg.password,
                'name="action"': action,
            }).val,
            headers: headers({ isMultipart: true }),
            agent: this.agent,
        });
    }

    async banchoConnect(retry = 0) {
        return await this.fetchOsuWeb({
            path: "bancho_connect.php",
            query: new Query({
                v: this.cfg.clientVersion,
                u: this.cfg.username,
                h: this.cfg.password,
                fx: this.cfg.dotnetEnv,
                ch: this.cfg.clientHashes,
                retry
            })
        }, {
            method: "GET",
            headers: headers(),
            agent: this.agent,
        });
    }

    async getFriends() {
        return await this.fetchOsuWeb({
            path: "osu-getfriends.php",
            query: new Query({
                u: this.cfg.username,
                h: this.cfg.password
            })
        }, {
            method: "GET",
            headers: headers(),
            agent: this.agent,
        });
    }
}

