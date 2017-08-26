import { Wallet } from "../";

export abstract class Database {
    protected static readonly DATABASE_TABLE = "burst";
    public abstract init(): void;
    public abstract saveWallet(wallet: Wallet): Promise<boolean>;
}
