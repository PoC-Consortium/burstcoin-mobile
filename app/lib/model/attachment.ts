
export class Attachment {
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class Message extends Attachment {
    messageIsText: boolean;
    message: string;

    constructor(data: any = {}) {
        super("message")
        this.messageIsText = data.messageIsText || false;
        this.message = data.message || undefined;
    }
}

export class EncryptedMessage extends Attachment {
    data: string;
    nonce: string;
    isText: boolean;

    constructor(data: any = {}) {
        super("encrypted_message")
        this.data = data.data || undefined;
        this.nonce = data.nonce || undefined;
        this.isText = data.isText || false;
    }
}
