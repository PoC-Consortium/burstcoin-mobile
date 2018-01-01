/*
    Copyright 2017 icewave.org
*/

export class Keys {
    public agreementPrivateKey: string;
    public signPrivateKey: string;
    public publicKey: string;

    constructor(data: any = {}) {
        this.agreementPrivateKey = data.agreementPrivateKey || undefined;
        this.signPrivateKey = data.signPrivateKey || undefined;
        this.publicKey = data.publicKey || undefined;
    }
}
