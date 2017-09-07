import { Injectable, OnInit } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { RouterExtensions } from "nativescript-angular/router";
import { device } from "platform";
import { Observable, ReplaySubject } from 'rxjs/Rx';

import { BurstAddress, Currency, HttpError, Keypair, Settings, Transaction, Wallet } from "../model";
import { CryptoService, DatabaseService, NotificationService} from "./";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class WalletService {

    private nodeUrl: string;

    public currentWallet: BehaviorSubject<any> = new BehaviorSubject(undefined);

    constructor(
        private http: Http = undefined,
        private cryptoService: CryptoService = undefined,
        private databaseService: DatabaseService = undefined,
        private notificationService: NotificationService = undefined
    ) {
        this.databaseService.settings.subscribe((settings: Settings) => {
            this.nodeUrl = "http://" + settings.node;
        });
    }

    public setCurrentWallet(wallet: Wallet) {
        this.currentWallet.next(wallet);
    }

    public createActiveWallet(passphrase: string, pin: string = ""): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            let wallet: Wallet = new Wallet();
            // import active wallet
            wallet.type = "active";
            return this.cryptoService.generateMasterPublicAndPrivateKey(passphrase)
                .then(keypair => {
                    wallet.keypair.publicKey = keypair.publicKey;
                    return this.cryptoService.encryptAES(keypair.privateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            wallet.keypair.privateKey = encryptedKey;
                            wallet.pinHash = this.hashPinStorage(pin);
                            return this.cryptoService.getAccountIdFromPublicKey(keypair.publicKey)
                                .then(id => {
                                    wallet.id = id;
                                    return this.cryptoService.getBurstAddressFromAccountId(id)
                                        .then(address => {
                                            wallet.address = address;
                                            return this.databaseService.saveWallet(wallet)
                                                .then(wallet => {
                                                    resolve(wallet);
                                                });
                                        });
                                });
                        });
                });
        });
    }

    public createOfflineWallet(address: string): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            let wallet: Wallet = new Wallet();
            this.databaseService.findWallet(BurstAddress.decode(address))
                .then(found => {
                    if (found == undefined) {
                        // import offline wallet
                        wallet.type = "offline";
                        wallet.address = address;
                        return this.cryptoService.getAccountIdFromBurstAddress(address)
                            .then(id => {
                                wallet.id = id;
                                return this.databaseService.saveWallet(wallet)
                                    .then(wallet => {
                                        resolve(wallet);
                                    });
                            });
                    } else {
                        reject("Burstcoin address already imported!");
                    }
                })
        });
    }

    public activateWallet(wallet: Wallet, passphrase: string, pin: string): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            this.cryptoService.generateMasterPublicAndPrivateKey(passphrase)
                .then(keys => {
                    wallet.keypair.publicKey = keys.publicKey;
                    this.cryptoService.encryptAES(keys.privateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            wallet.keypair.privateKey = encryptedKey;
                            wallet.pinHash = this.hashPinStorage(pin);
                            wallet.type = "active";
                            return this.databaseService.saveWallet(wallet)
                                .then(wallet => {
                                    this.notificationService.info(JSON.stringify(wallet));
                                    resolve(wallet);
                                });
                        })
                })
        });
    }

    public synchronizeWallet(wallet: Wallet): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            this.getBalance(wallet.id)
                .then(balance => {
                    wallet.balance = balance.confirmed;
                    wallet.unconfirmedBalance = balance.unconfirmed;
                    this.getTransactions(wallet.id)
                        .then(transactions => {
                            wallet.transactions = transactions;
                            this.databaseService.saveWallet(wallet)
                                .catch(error => {
                                    reject("Failed saving the wallet!");
                                })
                            resolve(wallet);
                        }).catch(error => reject("Failed retrieving transactions!"))
                }).catch(error => reject("Failed fetching wallet balance!"))
        });
    }

    public selectWallet(wallet: Wallet): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            this.databaseService.selectWallet(wallet)
                .then(wallet => {
                    this.setCurrentWallet(wallet);
                    resolve(wallet);
                })
        });
    }

    public getTransactions(id: string): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getAccountTransactions");
            params.set("firstIndex", "0");
            params.set("lastIndex", "15");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).toPromise()
                .then(response => {
                    let transactions: Transaction[] = [];
                    response.json().transactions.map(transaction => {
                        transaction.amountNQT = parseFloat(this.convertStringToNumber(transaction.amountNQT));
                        transaction.feeNQT = parseFloat(this.convertStringToNumber(transaction.feeNQT));
                        transactions.push(new Transaction(transaction));
                    });
                    resolve(transactions);
                })
                .catch(error => this.handleError(error));
        });
    }

    public getTransaction(id: string): Promise<Transaction> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("requestType", "getTransaction");
        params.set("transaction", id);
        let requestOptions = this.getRequestOptions();
        requestOptions.params = params;
        return this.http.get(this.nodeUrl, requestOptions).toPromise()
            .then(response => {
                return response.json() || [];
            })
            .catch(error => this.handleError(error));
    }

    public getBalance(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getBalance");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).toPromise()
                .then(response => {
                    if (response.json().errorCode == undefined) {
                        let balanceString = response.json().guaranteedBalanceNQT;
                        balanceString = this.convertStringToNumber(balanceString);
                        let unconfirmedBalanceString = response.json().unconfirmedBalanceNQT;
                        unconfirmedBalanceString = this.convertStringToNumber(unconfirmedBalanceString);
                        resolve({ confirmed: parseFloat(balanceString), unconfirmed: parseFloat(unconfirmedBalanceString)});
                    } else {
                        reject(0);
                    }
                })
                .catch(error => this.handleError(error));
        });
    }

    public doTransaction(transaction: Transaction, encryptedPrivateKey: string, pin: string): Promise<Transaction> {
        return new Promise((resolve, reject) => {
            let unsignedTransactionHex, sendFields, broadcastFields, transactionFields;
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "sendMoney");
            params.set("recipient", transaction.recipientAddress);
            params.set("amountNQT", this.convertNumberToString(transaction.amountNQT));
            params.set("feeNQT", this.convertNumberToString(transaction.feeNQT));
            params.set("publicKey", transaction.senderPublicKey);
            params.set("deadline", "1440");
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;

            // request 'sendMoney' to burst node
            return this.http.post(this.nodeUrl, {}, requestOptions).toPromise()
                .then(response => {
                    console.log(JSON.stringify(response));
                    if (response.json().unsignedTransactionBytes != undefined) {
                        // get unsigned transactionbytes
                        unsignedTransactionHex = response.json().unsignedTransactionBytes;
                        // sign unsigned transaction bytes
                        return this.cryptoService.generateSignature(unsignedTransactionHex, encryptedPrivateKey, this.hashPinEncryption(pin))
                            .then(signature => {
                                return this.cryptoService.verifySignature(signature, unsignedTransactionHex, transaction.senderPublicKey)
                                    .then(verified => {
                                        if (verified) {
                                            return this.cryptoService.generateSignedTransactionBytes(unsignedTransactionHex, signature)
                                                .then(signedTransactionBytes => {
                                                    params = new URLSearchParams();
                                                    params.set("requestType", "broadcastTransaction");
                                                    params.set("transactionBytes", signedTransactionBytes);
                                                    requestOptions = this.getRequestOptions();
                                                    requestOptions.params = params;
                                                    // request 'broadcastTransaction' to burst node
                                                    return this.http.post(this.nodeUrl, {}, requestOptions).toPromise()
                                                        .then(response => {
                                                            params = new URLSearchParams();
                                                            params.set("requestType", "getTransaction");
                                                            params.set("transaction", response.json().transaction);
                                                            requestOptions = this.getRequestOptions();
                                                            requestOptions.params = params;
                                                            // request 'getTransaction' to burst node
                                                            return this.http.get(this.nodeUrl, requestOptions).toPromise()
                                                                .then(response => {
                                                                    resolve(new Transaction(response.json()));
                                                                })
                                                                .catch(error => reject("Transaction error: Finalizing transaction!"));
                                                        })
                                                        .catch(error => reject("Transaction error: Executing transaction!"));
                                                }).catch(error => reject("Transaction error: Generating signed transaction!"));
                                        } else {
                                            reject("Transaction error: Verifying signature!");
                                        }
                                    }).catch(error => reject("Transaction error: Verifying signature!"));

                            }).catch(error => reject("Transaction error: Generating signature!"));
                        } else {
                            reject("Transaction error: Generating transaction. Check the recipient!");
                        }
                }).catch(error => reject("Transaction error: Generating transaction. Check the recipient!"));
        });
    }

    public checkPin(pin: string): boolean {
        return this.currentWallet.value != undefined ? this.currentWallet.value.pinHash == this.hashPinStorage(pin) : false;
    }

    public hashPinEncryption(pin: string): string {
        return this.cryptoService.hashSHA256(pin + device.uuid);
    }

    public hashPinStorage(pin: string): string {
        return this.cryptoService.hashSHA256(pin + device.model);
    }

    public isBurstcoinAddress(address: string): boolean {
        return /^BURST\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{5}/i.test(address) && BurstAddress.isValid(address);
    }

    public isPin(pin: string): boolean {
        return /^[0-9]{6}/i.test(pin);
    }

    public convertStringToNumber(str, value = ".", position = 8) {
        return str.substring(0, str.length - position) + value + str.substring(str.length - position);
    }

    public convertNumberToString(n: number) {
        return parseFloat(n.toString()).toFixed(8).replace(".", "");
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
}
