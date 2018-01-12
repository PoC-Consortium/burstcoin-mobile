/*
* Copyright 2018 PoC-Consortium
*/

import { device } from "platform";

/*
* Settings class
*
* The Settings class holds the settings for a device.
*/
export class Settings {
    public id: string;
    public contacts: string[];
    public currency: string;
    public language: string;
    public node: string;
    public theme: string;
    public version: string;

    constructor(data: any = {}) {
        this.id = "settings";
        if (data.contacts != undefined && data.contacts.length > 0) {
            this.contacts = data.contacts;
        } else {
            this.contacts = [];
        }
        this.currency = data.currency || "USD";
        this.language = data.language || device.language || "en";
        this.node = data.node || "https://wallet.burst.cryptoguru.org:8125/burst";
        this.theme = data.theme || "light";
        this.version = data.version || "";
    }
}
