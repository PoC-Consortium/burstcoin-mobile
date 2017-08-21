import { Injectable } from '@angular/core';
import { Database } from "../model/abstract";

let Sqlite = require("nativescript-sqlite");

@Injectable()
export class SqlLiteDatabaseService extends Database {

    private database: any;

    constructor() {
        super();
    }

    public init() {

    }

    public saveKeys(publicKey: string, encryptedPrivateKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            new Sqlite(Database.DATABASE_TABLE, (err, db) => {
                if (err) {
                    console.error("We failed to open database", err);
                    resolve(false);
                } else {
                    db.execSQL("insert into keys (publicKey, privateKey) values (?, ?)", [publicKey, encryptedPrivateKey], (err, id) => {
                        if (err) {
                            resolve(false);
                        } else {
                            console.log("The new record id is:", id);
                            resolve(true);
                        }
                    });
                }
            });
        });
    }
}
