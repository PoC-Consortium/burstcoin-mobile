

export class Transaction {
    id: number;
    height: number;
    deadline: number;
    senderId: number;
    senderPublicKey: number[];
    amountNQT: number;
    feeNQT: number;
    //type: TransactionType;
    version: number;
    timestamp: number;
    blockId: number;
    blockTimeStamp: number;
    fullHash: string;
    ecBlockHeight: number;
    ecBlockId: number;
    recipientId: number;
    referencedTransactionFullHash: string;
    signature: number[];

    /*
    private long recipientId;
    private String referencedTransactionFullHash;
    private byte[] signature;

    private final Attachment.AbstractAttachment attachment;
    private Appendix.Message message;
    private Appendix.EncryptedMessage encryptedMessage;
    private Appendix.EncryptToSelfMessage encryptToSelfMessage;
    private Appendix.PublicKeyAnnouncement publicKeyAnnouncement;
*/

}
