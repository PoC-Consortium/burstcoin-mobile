import { Transaction } from "./transaction";

export class Block {
    id: number;
    version: number;
    timestamp: number;
    height: number;
    previousBlockId: number;
    previousBlockHash: number[];
    generatorPublicKey: number[];
    totalAmountNQT: number;
    totalFeeNQT: number;
    playoadLength: number;
    generatorId: number;
    generationSignature: number[];
    playloadHash: number[];
    blockSignature: number[];
    cumulativeDifficulty: number;
    baseTarget: number;
    nextBlockId: number;
    nonce: number;
    byteLength: number;
    pocTime:number;
    blockAts: number[];
    transactions: Transaction[];

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.version = data.version || undefined;
        this.timestamp = data.timestamp || undefined;
        this.height = data.height || undefined;
        this.previousBlockId = data.previousBlockId || undefined;
        this.previousBlockHash = data.previousBlockHash || undefined;
        this.generatorPublicKey = data.generatorPublicKey || undefined;
        this.totalAmountNQT = data.totalAmountNQT || undefined;
        this.totalFeeNQT = data.totalFeeNQT || undefined;
        this.playoadLength = data.playoadLength || undefined;
        this.generatorId = data.generatorId || undefined;
        this.generationSignature = data.generationSignature || undefined;
        this.playloadHash = data.playloadHash || undefined;
        this.blockSignature = data.blockSignature || undefined;
        this.cumulativeDifficulty = data.cumulativeDifficulty || undefined;
        this.baseTarget = data.baseTarget || undefined;
        this.nextBlockId = data.nextBlockId || undefined;
        this.nonce = data.nonce || undefined;
        this.byteLength = data.byteLength || undefined;
        this.pocTime = data.pocTime || undefined;
        this.blockAts = data.blockAts || undefined;
        this.transactions = data.transactions || undefined;
    }
}
