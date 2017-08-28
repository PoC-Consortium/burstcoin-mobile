

export class Wallet {

    id: string;
    address: string;
    balance: number;
    type: string;
    selected: boolean;

    publicKey: string;
    privateKey: string;

    balanceStringBTC: string;
    balanceStringCur: string;

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || undefined;
        this.balanceStringBTC = data.balance || undefined;
        this.balanceStringCur = data.balance || undefined;
        this.type = data.type || undefined;
        this.selected = data.selected || undefined;
        this.publicKey = data.publicKey || undefined;
        this.privateKey = data.privateKey || undefined;
    }
}
