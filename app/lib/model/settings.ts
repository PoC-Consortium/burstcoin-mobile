/*
    Copyright 2017 icewave.org
*/

import { device } from "platform";

export class Settings {
    id: string;
    currency: string;
    language: string;
    node: string;
    version: string;
    theme: string;
    contacts: string[];

    constructor(data: any = {}) {
        this.id = "settings";
        this.currency = data.currency || "USD";
        this.language = data.language || device.language || "en";
        this.node = data.node || "https://wallet.burst.cryptoguru.org:8125/burst";
        this.version = data.version || "";
        this.theme = data.theme || "light";
        if (data.contacts != undefined && data.contacts.length > 0) {
            this.contacts = data.contacts;
        } else {
            this.contacts = [];
        }
    }
}
