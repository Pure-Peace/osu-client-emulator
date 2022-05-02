import https from "node:https";
import HttpProxyAgent from "http-proxy-agent";

import "dotenv/config";
import { OSU_HEADERS, MULTIPART_BONDARY, BASE_URI, CRLF, CONTENT_TYPE_FORM_DATA } from "./constants.js";

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

export function osuWeb(path: string) {
  return `${BASE_URI}/web/${path}`;
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

