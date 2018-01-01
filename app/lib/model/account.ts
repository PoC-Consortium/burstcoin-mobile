/*
    Copyright 2017 icewave.org
*/

import { Keys } from "./keys";
import { Transaction } from "./transaction";

export class Account {

    id: string;
    address: string;
    unconfirmedBalance: number;
    balance: number;
    type: string;
    selected: boolean;

    pinHash: string;
    keys: Keys;
    transactions: Transaction[];

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || 0;
        this.unconfirmedBalance = data.unconfirmedBalance || 0;
        this.type = data.type || "offline";
        this.selected = data.selected || false;
        if (data.keys != undefined) {
            this.keys = new Keys();
            this.pinHash = data.pinHash || undefined;
            this.keys.publicKey = data.keys.publicKey || undefined;
            this.keys.signPrivateKey = data.keys.signPrivateKey || undefined;
            this.keys.agreementPrivateKey = data.keys.agreementPrivateKey || undefined;
        }
        if (data.transactions != undefined && data.transactions.length > 0) {
            this.transactions = data.transactions;
        } else {
            this.transactions = [];
        }
    }
}
