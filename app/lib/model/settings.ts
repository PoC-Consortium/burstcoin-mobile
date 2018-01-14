/*
* Copyright 2018 PoC-Consortium
*/

import { device } from "platform";
import { constants } from "./constants";

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
        this.currency = data.currency || constants.defaultCurrency;
        this.language = data.language || device.language || constants.defaultLanguage;
        this.node = data.node || constants.defaultNode;
        this.theme = data.theme || constants.defaultTheme;
        this.version = data.version || constants.version;
    }
}
