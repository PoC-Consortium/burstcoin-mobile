
export class Transaction {
    id: string;

    senderId: string;
    senderAddress: string;
    senderPublicKey: string;

    recipientId: string;
    recipientAddress: string;
    recipientPublicKey: string;

    signature: string;
    signatureHash: string;
    fullHash: string;
    amountNQT: number;
    feeNQT: number;

    type: number;
    subtype: number;
    version: number;
    deadline: number;
    height: number;
    timestamp: number;

    constructor(data: any = {}) {
        this.id = data.transaction || undefined;
        this.senderId = data.sender || undefined;
        this.senderAddress = data.senderRS|| undefined;
        this.senderPublicKey = data.senderPublicKey || undefined;

        this.recipientId = data.recipientId || undefined;
        this.recipientAddress = data.recipientRS || undefined;

        this.signature = data.signature || undefined;
        this.signatureHash = data.signatureHash || undefined;
        this.fullHash = data.fullHash || undefined;
        this.amountNQT = data.amountNQT || 0;
        this.feeNQT = data.feeNQT || 0;

        this.type = data.type || 0;
        this.subtype = data.subtype || 0;
        this.version = data.version || 0;
        this.deadline = data.deadline || 0;
        this.timestamp = data.timestamp || 0;
        this.height = data.height || 0;
    }
}
