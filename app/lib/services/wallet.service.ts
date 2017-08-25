import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Account, Currency, HttpError, Transaction } from "../model";

@Injectable()
export class WalletService {

    //private static readonly walletURL: string = "https://wallet.cryptoguru.org";
    //private static readonly walletPort: string = "8125"; // Testnet

    private static readonly walletURL: string = "http://176.9.47.157";
    private static readonly walletPort: string = "6876"; // Testnet

    constructor(private http: Http) {

    }

    public getTransactions(account: Account): Promise<Transaction[]> {
        let fields = {
            "Content-Type": "application/json",
            "requestType": "getAccountTransactions",
            "firstIndex": 0,
            "lastIndex": 15,
            "account": account.id
        };
        return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(fields)).toPromise()
            .then(response => {
                return response.json() || [];
            })
            .catch(error => this.handleError(error));
    }

    public getTransaction(transaction: Transaction): Promise<Transaction[]> {
        let fields = {
            "Content-Type": "application/json",
            "requestType": "getTransaction",
            "transaction": transaction
        };
        return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(fields)).toPromise()
            .then(response => {
                return response.json() || [];
            })
            .catch(error => this.handleError(error));
    }

    public getBalance(account: Account): Promise<number> {
        let fields = {
            "Content-Type": "application/json",
            "requestType": "getBalance",
            "account": account.id
        };
        return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(fields)).toPromise()
            .then(response => {
                return response.json() || 0;
            })
            .catch(error => this.handleError(error));
    }

    public doTransaction(transaction: Transaction): Promise<Transaction> {
        let sendFields = {
            "Content-Type": "application/json",
        	"type": "sendMoney",
            "amountNQT": transaction.amountNQT,
            "feeNQT": transaction.feeNQT,
            "publicKey": transaction.senderPublicKey,
        };
        this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(sendFields)).toPromise()
            .then(response => {
                return response.json() || undefined;
            })
            .catch(error => this.handleError(error));

        let broadcastFields = {
            "Content-Type": "application/json",
        	"type": "sendMoney",
            "amountNQT": transaction.amountNQT,
            "feeNQT": transaction.feeNQT,
            "publicKey": transaction.senderPublicKey,
        };
    }

    public getRequestOptions(fields) {
        let headers = new Headers(fields);
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    private handleError(error: Response | any) {
        return Promise.reject(new HttpError(error.json()));
    }
}
