import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable, ReplaySubject } from 'rxjs/Rx';

import { Account, Currency, HttpError, Transaction } from "../model";
import { DatabaseService } from "./";


@Injectable()
export class AccountService {

    private account: Account;
    private currency: Currency;
    private accounts: Account[];
    private transaction: Transaction[];

    constructor(private databaseService: DatabaseService) {
        
    }

}
