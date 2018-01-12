/*
* Copyright 2018 PoC-Consortium
*/

import { Transaction } from "./transaction";

/*
* Block class
*
* NOT USED YET. CREATED IN REGARD TO SPV: https://bitcoin.org/bitcoin.pdf - §8
*/
export class Block {
    public id: number;
    public version: number;
    public timestamp: number;
    public height: number;
    public previousBlockId: number;
    public previousBlockHash: number[];
    public generatorPublicKey: number[];
    public totalAmountNQT: number;
    public totalFeeNQT: number;
    public playoadLength: number;
    public generatorId: number;
    public generationSignature: number[];
    public playloadHash: number[];
    public blockSignature: number[];
    public cumulativeDifficulty: number;
    public baseTarget: number;
    public nextBlockId: number;
    public nonce: number;
    public byteLength: number;
    public pocTime:number;
    public blockAts: number[];
    public transactions: Transaction[];

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
