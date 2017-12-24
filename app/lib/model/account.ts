/*
    Copyright 2017 icewave.org
*/

import { Keypair } from "./keypair";
import { Transaction } from "./transaction";

export class Account {

    id: string;
    address: string;
    unconfirmedBalance: number;
    balance: number;
    type: string;
    selected: boolean;

    pinHash: string;
    keypair: Keypair;
    transactions: Transaction[];
    contacts: string[];

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || 0;
        this.unconfirmedBalance = data.unconfirmedBalance || 0;
        this.type = data.type || "offline";
        this.selected = data.selected || false;
        this.keypair = new Keypair();
        if (data.keypair != undefined) {
            this.pinHash = data.pinHash || undefined;
            this.keypair.publicKey = data.keypair.publicKey || undefined;
            this.keypair.privateKey = data.keypair.privateKey || undefined;
        }
        if (data.transactions != undefined && data.transactions.length > 0) {
            this.transactions = data.transactions;
        } else {
            this.transactions = [];
        }
        if (data.contacts != undefined && data.contacts.length > 0) {
            this.contacts = data.contacts;
        } else {
            this.contacts = [];
        }
    }
}
