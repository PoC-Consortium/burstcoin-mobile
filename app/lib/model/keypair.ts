
export class Keypair {
    public privateKey: string;
    public publicKey: string;

    constructor(data: any = {}) {
        this.privateKey = data.privateKey || undefined;
        this.publicKey = data.publicKey || undefined;
    }
}
