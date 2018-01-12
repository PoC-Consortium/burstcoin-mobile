/*
* Copyright 2018 PoC-Consortium
*/

import { Account } from "../";

/*
* Database class
*
* An abstract class defining the essential database methods.
*/
export abstract class Database {
    protected static readonly DATABASE_TABLE = "burst";
    public abstract init(): void;
    public abstract saveAccount(account: Account): Promise<Account>;
    public abstract findAccount(id: string): Promise<Account>;
    public abstract getSelectedAccount(): Promise<Account>;
    public abstract removeAccount(account: Account): Promise<boolean>;
}
