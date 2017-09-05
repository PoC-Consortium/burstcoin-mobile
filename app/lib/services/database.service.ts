import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Database } from "../model/abstract";
import { Settings, Wallet } from "../model";

let fs = require("file-system");
let Loki = require("lokijs");
let LokiNativeScriptAdapter = require("loki-nativescript-adapter");

@Injectable()
export class DatabaseService extends Database {

    private database: any;
    private static readonly path: string = fs.path.join(fs.knownFolders.currentApp().path, "loki.db");

    public ready: BehaviorSubject<any> = new BehaviorSubject(false);

    constructor() {
        super();
        this.database = new Loki(DatabaseService.path, {
            autoload: true,
            autoloadCallback: this.init.bind(this),
            adapter: new LokiNativeScriptAdapter()
        });
    }

    public init() {
        let wallets = this.database.getCollection("wallets");
        if (wallets == null) {
            wallets = this.database.addCollection("wallets", { unique : ["id"]});
        }
        let settings = this.database.getCollection("settings");
        if (settings == null) {
            settings = this.database.addCollection("settings", { unique : ["currency", "language", "node", "notification", "patchnotes", "theme"]});
            settings.insert(new Settings());
            console.log(JSON.stringify(settings.data));
        }
        this.database.saveDatabase();
        this.setReady(true);
    }

    public setReady(state: boolean) {
        this.ready.next(state);
    }

    public saveWallet(wallet: Wallet): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                // clean wallet
                wallet = this.cleanWallet(wallet);
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.find({ id : wallet.id });
                if (rs.length == 0) {
                    wallets.insert(wallet);
                } else {
                    wallets.chain().find({ id : wallet.id }).update(w => {
                        w.balance = wallet.balance;
                        w.type = wallet.type;
                        w.selected = wallet.selected;
                        w.keypair.publicKey = wallet.keypair.publicKey;
                        w.keypair.privateKey = wallet.keypair.privateKey;
                        w.transactions = wallet.transactions;
                    });
                }
                this.database.saveDatabase();
                resolve(wallet);
            } else {
                reject(undefined);
            }
        });
    }

    public getSelectedWallet(): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let wallets = this.database.getCollection("wallets");
                console.log(wallets.data)
                let rs = wallets.find({ selected : true });
                if (rs.length > 0) {
                    let wallet = new Wallet(rs[0]);
                    resolve(wallet);
                } else {
                    rs = wallets.find();
                    if (rs.length > 0) {
                        wallets.chain().find({ id : rs[0].id }).update(w => {
                            w.selected = true;
                        });
                        let w = new Wallet(rs[0]);
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

    public selectWallet(wallet: Wallet): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                wallet.selected = true;
                let wallets = this.database.getCollection("wallets");
                wallets.chain().find().update(w => {
                    w.selected = false;
                });
                wallets.chain().find({ id : wallet.id }).update(w => {
                    w.selected = true;
                });
                this.database.saveDatabase();
                resolve(wallet);
            } else {
                reject(undefined);
            }
        });
    }

    public getAllWallets(): Promise<Wallet[]> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.find();
                let ws = [];
                rs.map(single => {
                    ws.push(new Wallet(single))
                })
                resolve(ws);
            } else {
                reject([]);
            }
        });
    }

    public findWallet(id: string): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.find({ id : id });
                if (rs.length > 0) {
                    let wallet = new Wallet(rs[0]);
                    resolve(wallet);
                } else {
                    resolve(undefined)
                }
            } else {
                reject(undefined);
            }
        });
    }

    public removeWallet(wallet: Wallet): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.chain().find({ id : wallet.id }).remove();
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }

    public saveSettings(settings: Settings): Promise<Settings> {
        return new Promise((resolve, reject) => {
            if (this.ready.value) {
                let settings = this.database.getCollection("settings");
                let rs = settings.find();
                if (rs.length > 0) {
                    settings.chain().find({ id: settings.id }).update(s => {
                        s.currency = settings.currency;
                        s.language = settings.language;
                        s.node = settings.node;
                        s.version = settings.version;
                        s.theme = settings.theme;
                    });
                } else {
                    settings.insert(settings);
                }
                this.database.saveDatabase();
                resolve(settings);
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

    private cleanWallet(wallet: Wallet): Wallet {
        wallet.balanceStringBTC = undefined;
        wallet.balanceStringCur = undefined;
        return wallet;
    }
}
