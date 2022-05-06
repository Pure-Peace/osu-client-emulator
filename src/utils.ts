import https from "node:https";
import HttpProxyAgent from "http-proxy-agent";

import "dotenv/config";
import { OSU_HEADERS, MULTIPART_BONDARY, CRLF, CONTENT_TYPE_FORM_DATA } from "./constants.js";

export function agent() {
  if (process.env.FIDDLER_PROXY) {
    return HttpProxyAgent(process.env.FIDDLER_PROXY);
  }
  return (_parsedURL: { protocol: string; }) => {
    if (_parsedURL.protocol == "http:") {
      return new https.Agent({
        keepAlive: true,
      });
    } else {
      return new https.Agent({
        keepAlive: true,
      });
    }
  };
}

export function headers({ isMultipart } = { isMultipart: false }) {
  if (isMultipart) {
    return {
      ...OSU_HEADERS,
      "Content-Type": `multipart/form-data; boundary=${MULTIPART_BONDARY}`,
    };
  }
  return OSU_HEADERS;
}

export class OsuMultipart {
  inner: string;

  constructor() {
    this.inner = "";
  }

  add(key: string, value: string) {
    this.inner = this.inner.concat(
      MULTIPART_BONDARY,
      CRLF,
      CONTENT_TYPE_FORM_DATA,
      key,
      CRLF,
      CRLF,
      value,
      CRLF
    );
    return this;
  }

  addDict(dict: { [key: string]: string }) {
    for (const key in dict) {
      this.add(key, dict[key]);
    }
    return this;
  }

  build() {
    return this.inner.concat(MULTIPART_BONDARY, "--", CRLF);
  }
}

const UNITS: [number, string][] = [[1000000000, 's'], [1000000, 'ms'], [1000, 'us'], [0, 's']]

export class Instant {
  start: bigint;
  end: bigint = BigInt(0);

  constructor(start: bigint) {
    this.start = start
  }

  static now() {
    return new Instant(process.hrtime.bigint())
  }

  elapsed() {
    this.end = process.hrtime.bigint();
    return this;
  }

  get duration() {
    return this.end - this.start;
  }

  get digit() {
    return this.duration;
  }

  get human() {
    for (const [u, un] of UNITS) {
      if (this.duration >= u) {
        return `${this.duration / BigInt(u)}${un}`
      }
    }
  }
}

export type Dict = { [key: string]: string | number }

export class Query {
  private inner: string;

  constructor(dict: Dict) {
    this.inner = "";
    this.addDict(dict)
  }

  add(key: string, value: string | number) {
    this.inner += `${this.inner.endsWith('&') ? '' : '&'}${key}=${value}`
    return this
  }

  addDict(dict: Dict) {
    Object.entries(dict).forEach(([k, v]) => this.add(k, v))
    return this
  }

  get val() {
    return this.inner ?? ''
  }
}

export function lazyConstruct<T extends object>(constructor: any, val: any): T {
  return (val instanceof constructor) ? val : new constructor(val)
}