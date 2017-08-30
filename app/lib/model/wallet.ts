import { Keypair } from "./keypair";
import { Transaction } from "./transaction";

export class Wallet {

    id: string;
    address: string;
    balance: number;
    type: string;
    selected: boolean;

    balanceStringBTC: string;
    balanceStringCur: string;

    pin: string;
    keypair: Keypair;
    transactions: Transaction[];

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || undefined;
        this.balanceStringBTC = data.balance || undefined;
        this.balanceStringCur = data.balance || undefined;
        this.type = data.type || undefined;
        this.selected = data.selected || undefined;
        this.keypair = new Keypair();
        if (data.keypair != undefined) {
            this.pin = data.pin || undefined;
            this.keypair.publicKey = data.keypair.publicKey || undefined;
            this.keypair.privateKey = data.keypair.privateKey || undefined;
        }
        if (data.transactions != undefined && data.transactions.length > 0) {
            this.transactions = data.transactions;
        } else {
            this.transactions = [];
        }
    }
}
