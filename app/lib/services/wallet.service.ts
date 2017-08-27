import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Observable, ReplaySubject } from 'rxjs/Rx';

import { Currency, HttpError, Transaction, Wallet } from "../model";
import { CryptoService, DatabaseService, NotificationService} from "./";

import 'rxjs/add/operator/toPromise';


@Injectable()
export class WalletService {

    //private static readonly walletURL: string = "https://wallet.cryptoguru.org";
    //private static readonly walletPort: string = "8125"; // Testnet

    private static readonly walletURL: string = "http://176.9.47.157:6876/burst";
    private static readonly walletPort: string = "6876"; // Testnet

    constructor(
        private http: Http = undefined,
        private cryptoService: CryptoService = undefined,
        private databaseService: DatabaseService = undefined,
        private notificationService: NotificationService = undefined) {

    }

    public isBurstcoinAddress(address: string): boolean {
        return /^BURST\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{5}/i.test(address);
    }

    public importBurstcoinWallet(input: string, active: boolean) {
        let wallet: Wallet = new Wallet();
        if (active) {
            // import active wallet
            wallet.type = "active";
        } else {
            // import offline wallet
            wallet.type = "offline";
            wallet.address = input;
            wallet.selected = true;
            this.cryptoService.getAccountIdFromBurstAddress(input)
                .then(id => {
                    wallet.id = id;
                    this.getBalance(wallet.id)
                        .then(balance => {
                            console.log(balance);
                            this.databaseService.saveWallet(wallet).then(ac => {
                                this.notificationService.info("saved");
                            });
                        });
                });
        }
        return new Promise((resolve, reject) => {

        });
    }

    public getTransactions(wallet: Wallet): Promise<Transaction[]> {
        let fields = {
            "Content-Type": "application/json",
            "requestType": "getAccountTransactions",
            "firstIndex": 0,
            "lastIndex": 15,
            "account": wallet.id
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

    public getBalance(id: string): Promise<number> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("requestType", "getBalance");
        params.set("account", id);
        let requestOptions = this.getRequestOptions();
        requestOptions.params = params;
        return this.http.get(WalletService.walletURL, requestOptions).toPromise()
            .then(response => {
                let balanceString = response.json().guaranteedBalanceNQT;
                balanceString = this.convertStringToNumber(balanceString);
                return parseFloat(balanceString);
            })
            .catch(error => this.handleError(error));
    }

    public doTransaction(transaction: Transaction): Promise<Transaction> {
        let unsignedTransactionBytes, sendFields, broadcastFields, transactionFields;
        // TODO: maybe all on client signing??? WTF
        sendFields = {
            "Content-Type": "application/json",
        	"type": "sendMoney",
            "amountNQT": transaction.amountNQT,
            "feeNQT": transaction.feeNQT,
            "publicKey": transaction.senderPublicKey,
        };
        // request 'sendMoney' to burst node
        return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(sendFields)).toPromise()
            .then(response => {
                // get unsigned transactionbytes
                unsignedTransactionBytes = response.json().unsignedTransactionBytes || undefined;
                // sign unsigned transaction bytes
                return this.cryptoService.signTransactionBytes(unsignedTransactionBytes)
                    .then(signedTransactionBytes => {
                        broadcastFields = {
                            "Content-Type": "application/json",
                            "type": "broadcastTransaction",
                            "transactionBytes": signedTransactionBytes
                        };
                        // request 'broadcastTransaction' to burst node
                        return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(broadcastFields)).toPromise()
                            .then(response => {
                                transactionFields = {
                                    "Content-Type" : "application/json",
                                    "type" : "getTransaction",
                                    "transaction": response.json().transaction
                                }
                                // request 'getTransaction' to burst node
                                return this.http.get(WalletService.walletURL + ":" + WalletService.walletPort, this.getRequestOptions(transactionFields)).toPromise()
                                    .then(response => {
                                        return new Transaction(response.json());
                                    })
                                    .catch(error => this.handleError(error));
                            })
                            .catch(error => this.handleError(error));
                    });
            })
            .catch(error => this.handleError(error));
    }

    public getRequestOptions(fields = {}) {
        let headers = new Headers(fields);
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    private handleError(error: Response | any) {
        console.log(error);
        return Promise.reject(new HttpError(error));
    }

    private convertStringToNumber(str, value = ".", position = 8) {
        return str.substring(0, str.length - position) + value + str.substring(str.length-position);
    }
}
