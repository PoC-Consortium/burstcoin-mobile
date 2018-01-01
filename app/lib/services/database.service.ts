/*
    Copyright 2017 icewave.org
*/

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Database } from "../model/abstract";
import { Account, Settings } from "../model";

import * as fs from "tns-core-modules/file-system";

let Loki = require("lokijs");
let LokiNativeScriptAdapter = require("loki-nativescript-adapter");

@Injectable()
export class DatabaseService extends Database {

    private database: any;
    private static readonly path: string = fs.path.join(fs.knownFolders.documents().path, "loki.db");

    public ready: BehaviorSubject<any> = new BehaviorSubject(false);
    public settings: BehaviorSubject<any> = new BehaviorSubject(false);

    constructor() {
        super();
        this.database = new Loki(DatabaseService.path, {
            autoload: true,
            autoloadCallback: this.init.bind(this),
            adapter: new LokiNativeScriptAdapter()
        });
    }

    public init() {
        let accounts = this.database.getCollection("accounts");
        if (accounts == null) {
            accounts = this.database.addCollection("accounts", { unique : ["id"]});
        }
        let settings = this.database.getCollection("settings");
        if (settings == null) {
            settings = this.database.addCollection("settings", { unique : ["currency", "id", "language", "node", "notification", "patchnotes", "theme"]});
            settings.insert(new Settings());
        }
        this.database.saveDatabase();
        this.setReady(true);
        this.getSettings()
            .then(s => {
                this.setSettings(s);
            })
            .catch(error => {
                this.setSettings(new Settings());
            })
    }

    public setReady(state: boolean) {
        this.ready.next(state);
    }

    public setSettings(state: Settings) {
        this.settings.next(state);
    }

    public saveAccount(account: Account): Promise<Account> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let accounts = this.database.getCollection("accounts");
                let rs = accounts.find({ id : account.id });
                if (rs.length == 0) {
                    accounts.insert(account);
                } else {
                    accounts.chain().find({ id : account.id }).update(w => {
                        w.balance = account.balance;
                        w.type = account.type;
                        w.selected = account.selected;
                        w.keys.publicKey = account.keys.publicKey;
                        w.keys.signPrivateKey = account.keys.signPrivateKey;
                        w.keys.agreementPrivateKey = account.keys.agreementPrivateKey;
                        w.transactions = account.transactions;
                    });
                }
                this.database.saveDatabase();
                resolve(account);
            } else {
                reject(undefined);
            }
        });
    }

    public getSelectedAccount(): Promise<Account> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let accounts = this.database.getCollection("accounts");
                let rs = accounts.find({ selected : true });
                if (rs.length > 0) {
                    let account = new Account(rs[0]);
                    resolve(account);
                } else {
                    rs = accounts.find();
                    if (rs.length > 0) {
                        accounts.chain().find({ id : rs[0].id }).update(w => {
                            w.selected = true;
                        });
                        let w = new Account(rs[0]);
                        this.database.saveDatabase();
                        resolve(w);
                    } else {
                        reject(undefined);
                    }
                    reject(undefined);
                }
            } else {
                reject(undefined);
            }
        });
    }

    public selectAccount(account: Account): Promise<Account> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                account.selected = true;
                let accounts = this.database.getCollection("accounts");
                accounts.chain().find({ selected : true }).update(w => {
                    w.selected = false;
                });
                accounts.chain().find({ id : account.id }).update(w => {
                    w.selected = true;
                });
                this.database.saveDatabase();
                resolve(account);
            } else {
                reject(undefined);
            }
        });
    }

    public getAllAccounts(): Promise<Account[]> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let accounts = this.database.getCollection("accounts");
                let rs = accounts.find();
                let ws = [];
                rs.map(single => {
                    ws.push(new Account(single))
                })
                resolve(ws);
            } else {
                reject([]);
            }
        });
    }

    public findAccount(id: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let accounts = this.database.getCollection("accounts");
                let rs = accounts.find({ id : id });
                if (rs.length > 0) {
                    let account = new Account(rs[0]);
                    resolve(account);
                } else {
                    resolve(undefined)
                }
            } else {
                reject(undefined);
            }
        });
    }

    public removeAccount(account: Account): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let accounts = this.database.getCollection("accounts");
                let rs = accounts.chain().find({ id : account.id }).remove();
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }

    public saveSettings(save: Settings): Promise<Settings> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let settings = this.database.getCollection("settings");
                let rs = settings.find({ id: save.id });
                if (rs.length > 0) {
                    settings.chain().find({ id: save.id }).update(s => {
                        s.currency = save.currency;
                        s.language = save.language;
                        s.node = save.node;
                        s.version = save.version;
                        s.theme = save.theme;
                        s.contacts = save.contacts;
                    });
                } else {
                    settings.insert(save);
                }
                this.database.saveDatabase();
                this.setSettings(save);
                resolve(save);
            } else {
                reject(undefined);
            }
        });
    }

    public getSettings(): Promise<Settings> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let settings = this.database.getCollection("settings");
                let rs = settings.find();
                resolve(new Settings(rs[0]));
            } else {
                resolve(new Settings());
            }
        });
    }

}
