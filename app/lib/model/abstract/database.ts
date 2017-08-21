

export abstract class Database {
    protected static readonly DATABASE_TABLE = "burst";
    public abstract init(): void;
    public abstract saveKeys(publicKey: string, encryptedPrivateKey: string): Promise<boolean>;
}
