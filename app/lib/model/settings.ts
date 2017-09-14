
export class Settings {
    id: string;
    currency: string;
    language: string;
    node: string;
    version: string;
    theme: string;

    constructor(data: any = {}) {
        this.id = "settings";
        this.currency = data.currency || "USD";
        this.language = data.language || "US";
        this.node = data.node || "wallet.burst.cryptoguru.org:8125/burst";
        this.version = data.version || "";
        this.theme = data.theme || "light";
    }
}
