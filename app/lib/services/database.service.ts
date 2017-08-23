import { Injectable } from '@angular/core';
import { Database } from "../model/abstract";

let Loki = require('lokijs');

@Injectable()
export class DatabaseService extends Database {

    private database: any;
    private ready: boolean;

    constructor() {
        super();
        this.database = this.database = new Loki("wallet.db", {
            autoload: true,
            autoloadCallback: this.init.bind(this)
        });
    }

    public init() {
        let keys = this.database.getCollection("keys");
        if (keys === null) {
            keys = this.database.addCollection("keys", { unique : ["pk"]});
        }
        this.ready = true;
        this.database.saveDatabase();
    }

    public saveKeys(publicKey: string, privateKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("keys");
                keys.insert({ pk : publicKey, sk : privateKey });
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject("Database not ready");
            }
        });
    }

    public findKeys(publicKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("keys");
                let rs = keys.find({ pk : publicKey });
                resolve(rs);
            } else {
                reject(false);
            }
        });
    }

    public removeKeys(publicKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.ready) {
                let keys = this.database.getCollection("keys");
                let rs = keys.chain().find({ pk : publicKey }).remove();
                this.database.saveDatabase();
                resolve(true);
            } else {
                reject(false);
            }
        });
    }
}
