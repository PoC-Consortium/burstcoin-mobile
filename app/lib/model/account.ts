

export class Account {

    id: number;
    address: string;
    balance: number;
    type: string;

    publicKey: string;
    privateKey: string;

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || undefined;
        this.type = data.type || undefined;
        this.publicKey = data.publicKey || undefined;
        this.privateKey = data.privateKey || undefined;
    }
}
