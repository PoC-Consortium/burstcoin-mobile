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
    private static readonly path: string = fs.path.join(fs.knownFolders.currentApp().path, "wallet.db");

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
                    /*
                    wallets.chain().find({ id : wallet.id }).update(w => {
                        console.log(JSON.stringify(w));

                    });
                    */
                }
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }

    public findWallet(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("wallet");
                let rs = keys.find({ id : id });
                resolve(rs);
            } else {
                reject(false);
            }
        });
    }

    public removeWallet(wallet: Wallet): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("keys");
                let rs = keys.chain().find({ id : wallet.id }).remove();
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }
}
