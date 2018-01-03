/*
    Copyright 2017 icewave.org
*/

import { Attachment, EncryptedMessage, Message } from "./attachment"

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
    block: string;

    amountNQT: number;
    feeNQT: number;
    confirmations: number;
    confirmed: boolean;

    type: number;
    subtype: number;
    version: number;
    deadline: number;
    height: number;
    blockTimestamp: number;
    timestamp: number;

    attachment: Attachment;

    constructor(data: any = {}) {
        this.id = data.transaction || undefined;
        this.senderId = data.sender || undefined;
        this.senderAddress = data.senderRS|| undefined;
        this.senderPublicKey = data.senderPublicKey || undefined;

        this.recipientId = data.recipient || undefined;
        this.recipientAddress = data.recipientRS || undefined;

        this.signature = data.signature || undefined;
        this.signatureHash = data.signatureHash || undefined;
        this.fullHash = data.fullHash || undefined;
        this.block = data.block || undefined;

        this.amountNQT = data.amountNQT || 0;
        this.feeNQT = data.feeNQT || 0;
        this.confirmations = data.confirmations || 0;
        this.confirmed = data.confirmed == false ? false : true;

        this.type = data.type || 0;
        this.subtype = data.subtype || 0;
        this.version = data.version || 0;
        this.deadline = data.deadline || 0;
        this.timestamp = data.timestamp || 0;
        this.height = data.height || 0;
        this.blockTimestamp = data.blockTimestamp || 0;

        // message attachment
        if (data.attachment != undefined && data.attachment.message != undefined) {
            this.attachment = new Message(data.attachment);
        }
        // encryptedMessage attachment
        if (data.attachment != undefined && data.attachment.encryptedMessage != undefined) {
            this.attachment = new EncryptedMessage(data.attachment.encryptedMessage)
        }
    }
}
