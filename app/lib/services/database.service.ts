import { Injectable } from '@angular/core';
import { Database } from "../model/abstract";
import { Wallet } from "../model";

let fs = require("file-system");
let Loki = require("lokijs");
let LokiNativeScriptAdapter = require("loki-nativescript-adapter");

@Injectable()
export class DatabaseService extends Database {

    private database: any;
    private ready: boolean;
    private static readonly path: string = fs.path.join(fs.knownFolders.currentApp().path, "loki.db");

    constructor() {
        super();
        this.database = this.database = new Loki(DatabaseService.path, {
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
            settings = this.database.addCollection("settings", { unique : ["id"]});
        }
        this.ready = true;
        this.database.saveDatabase();
    }

    public saveWallet(wallet: Wallet): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.find({ id : wallet.id });
                if (rs.length == 0) {
                    wallets.insert(wallet);
                } else {
                    wallets.chain().find({ id : wallet.id }).update(w => {
                        w.balance = wallet.balance;
                        w.type = wallet.type;
                        w.selected = wallet.selected;
                        w.publicKey = wallet.publicKey;
                        w.privateKey = wallet.privateKey;
                    });
                }
                console.log(JSON.stringify(wallets.data));
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }

    public getWallet(id: string): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("wallet");
                let rs = keys.find({ id : id });
                if (rs.length > 0) {
                    let wallet = new Wallet(rs[0]);
                    resolve(wallet);
                } else {
                    resolve(undefined)
                }
            } else {
                reject(false);
            }
        });
    }

    public removeWallet(wallet: Wallet): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let wallets = this.database.getCollection("wallets");
                let rs = wallets.chain().find({ id : wallet.id }).remove();
                console.log(JSON.stringify(wallets.data));
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }
}
