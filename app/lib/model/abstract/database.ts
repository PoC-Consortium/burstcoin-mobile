import { Wallet } from "../";

export abstract class Database {
    protected static readonly DATABASE_TABLE = "burst";
    public abstract init(): void;
    public abstract saveWallet(wallet: Wallet): Promise<Wallet>;
    public abstract findWallet(id: string): Promise<Wallet>;
    public abstract getSelectedWallet(): Promise<Wallet>;
    public abstract removeWallet(wallet: Wallet): Promise<boolean>;
}
