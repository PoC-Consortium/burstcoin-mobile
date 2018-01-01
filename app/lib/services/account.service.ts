/*
    Copyright 2017 icewave.org
*/

import { Injectable, OnInit } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { RouterExtensions } from "nativescript-angular/router";
import { device } from "platform";
import { Observable, ReplaySubject } from 'rxjs/Rx';

import { Account, BurstAddress, Currency, HttpError, Keys, Settings, Transaction } from "../model";
import { NoConnectionError, UnknownAccountError } from "../model/error";
import { CryptoService, DatabaseService, NotificationService} from "./";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class AccountService {

    private nodeUrl: string;
    private timeout: number = 10000; // 10 seconds

    public currentAccount: BehaviorSubject<any> = new BehaviorSubject(undefined);

    constructor(
        private http: Http,
        private cryptoService: CryptoService,
        private databaseService: DatabaseService,
        private notificationService: NotificationService
    ) {
        this.databaseService.settings.subscribe((settings: Settings) => {
            this.nodeUrl = settings.node;
        });
    }

    public setCurrentAccount(account: Account) {
        this.currentAccount.next(account);
    }

    public createActiveAccount(passphrase: string, pin: string = ""): Promise<Account> {
        return new Promise((resolve, reject) => {
            let account: Account = new Account();
            // import active account
            account.type = "active";
            return this.cryptoService.generateMasterKeys(passphrase)
                .then(keys => {
                    account.keys.publicKey = keys.publicKey;
                    return this.cryptoService.encryptAES(keys.signPrivateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            account.keys.signPrivateKey = encryptedKey;
                            return this.cryptoService.encryptAES(keys.agreementPrivateKey, this.hashPinEncryption(pin))
                                .then(encryptedKey => {
                                    account.keys.agreementPrivateKey = encryptedKey;
                                    account.pinHash = this.hashPinStorage(pin, keys.publicKey);
                                    return this.cryptoService.getAccountIdFromPublicKey(keys.publicKey)
                                        .then(id => {
                                            account.id = id;
                                            return this.cryptoService.getBurstAddressFromAccountId(id)
                                                .then(address => {
                                                    account.address = address;
                                                    return this.databaseService.saveAccount(account)
                                                        .then(account => {
                                                            resolve(account);
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
    }

    public createOfflineAccount(address: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            let account: Account = new Account();
            this.databaseService.findAccount(BurstAddress.decode(address))
                .then(found => {
                    if (found == undefined) {
                        // import offline account
                        account.type = "offline";
                        account.address = address;
                        return this.cryptoService.getAccountIdFromBurstAddress(address)
                            .then(id => {
                                account.id = id;
                                return this.databaseService.saveAccount(account)
                                    .then(account => {
                                        resolve(account);
                                    });
                            });
                    } else {
                        reject("Burstcoin address already imported!");
                    }
                })
        });
    }

    public activateAccount(account: Account, passphrase: string, pin: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.cryptoService.generateMasterKeys(passphrase)
                .then(keys => {
                    account.keys.publicKey = keys.publicKey;
                    return this.cryptoService.encryptAES(keys.signPrivateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            account.keys.signPrivateKey = encryptedKey;
                            return this.cryptoService.encryptAES(keys.agreementPrivateKey, this.hashPinEncryption(pin))
                                .then(encryptedKey => {
                                    account.keys.agreementPrivateKey = encryptedKey;
                                    account.pinHash = this.hashPinStorage(pin, keys.publicKey);
                                    account.type = "active";
                                    return this.databaseService.saveAccount(account)
                                        .then(account => {
                                            resolve(account);
                                        });
                                });
                        });
                })
        });
    }

    public removeAccount(account: Account): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.databaseService.removeAccount(account)
                .then(success => {
                    resolve(success);
                })
                .catch(error => {
                    reject(error);
                })
        });
    }

    public synchronizeAccount(account: Account): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.getBalance(account.id)
                .then(balance => {
                    account.balance = balance.confirmed;
                    account.unconfirmedBalance = balance.unconfirmed;
                    this.getTransactions(account.id)
                        .then(transactions => {
                            account.transactions = transactions;
                            this.getUnconfirmedTransactions(account.id)
                                .then(transactions => {
                                    account.transactions = transactions.concat(account.transactions);
                                    this.databaseService.saveAccount(account)
                                        .catch(error => { console.log("Failed saving the account!"); })
                                    resolve(account);
                                }).catch(error => reject(error))
                        }).catch(error => reject(error))
                }).catch(error => reject(error))
        });
    }

    public selectAccount(account: Account): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.databaseService.selectAccount(account)
                .then(account => { })
            this.setCurrentAccount(account);
            resolve(account);
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
            return this.http.get(this.nodeUrl, requestOptions).timeout(this.timeout).toPromise()
                .then(response => {
                    let transactions: Transaction[] = [];
                    response.json().transactions.map(transaction => {
                        transaction.amountNQT = parseFloat(this.convertStringToNumber(transaction.amountNQT));
                        transaction.feeNQT = parseFloat(this.convertStringToNumber(transaction.feeNQT));
                        transactions.push(new Transaction(transaction));
                    });
                    resolve(transactions);
                })
                .catch(error => reject(new NoConnectionError()));
        });
    }

    public getUnconfirmedTransactions(id: string): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getUnconfirmedTransactions");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(this.timeout).toPromise()
                .then(response => {
                    let transactions: Transaction[] = [];
                    response.json().unconfirmedTransactions.map(transaction => {
                        transaction.amountNQT = parseFloat(this.convertStringToNumber(transaction.amountNQT));
                        transaction.feeNQT = parseFloat(this.convertStringToNumber(transaction.feeNQT));
                        transaction.confirmed = false;
                        transactions.push(new Transaction(transaction));
                    });
                    resolve(transactions);
                })
                .catch(error => reject(new NoConnectionError()));
        });
    }

    public getTransaction(id: string): Promise<Transaction> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getTransaction");
            params.set("transaction", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(this.timeout).toPromise()
                .then(response => {
                    return response.json() || [];
                })
                .catch(error => reject(new NoConnectionError()));
        });
    }

    public getBalance(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getBalance");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(this.timeout).toPromise()
                .then(response => {
                    if (response.json().errorCode == undefined) {
                        let balanceString = response.json().guaranteedBalanceNQT;
                        balanceString = this.convertStringToNumber(balanceString);
                        let unconfirmedBalanceString = response.json().unconfirmedBalanceNQT;
                        unconfirmedBalanceString = this.convertStringToNumber(unconfirmedBalanceString);
                        resolve({ confirmed: parseFloat(balanceString), unconfirmed: parseFloat(unconfirmedBalanceString) });
                    } else {
                        if (response.json().errorDescription == "Unknown account") {
                            reject(new UnknownAccountError())
                        } else {
                            reject(new Error("Failed fetching balance"));
                        }
                    }
                })
                .catch(error => reject(new NoConnectionError()));
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
            if (transaction.attachment != undefined) {
                if (transaction.attachment.messageIsEncrypted) {
                    params.set("encryptedMessageData", transaction.attachment.message)
                    params.set("encryptedMessageNonce", transaction.attachment.nonce)
                    params.set("messageToEncryptIsText", String(transaction.attachment.messageIsText))
                } else {
                    params.set("message", transaction.attachment.message)
                    params.set("messageIsText", String(transaction.attachment.messageIsText))
                }
            }
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;

            // request 'sendMoney' to burst node
            return this.http.post(this.nodeUrl, {}, requestOptions).timeout(this.timeout).toPromise()
                .then(response => {
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
                                                    return this.http.post(this.nodeUrl, {}, requestOptions).timeout(this.timeout).toPromise()
                                                        .then(response => {
                                                            params = new URLSearchParams();
                                                            params.set("requestType", "getTransaction");
                                                            params.set("transaction", response.json().transaction);
                                                            requestOptions = this.getRequestOptions();
                                                            requestOptions.params = params;
                                                            // request 'getTransaction' to burst node
                                                            return this.http.get(this.nodeUrl, requestOptions).timeout(this.timeout).toPromise()
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
                        console.log(JSON.stringify(response.json()))
                        reject("Transaction error: Generating transaction. Check the recipient!");
                    }
                }).catch(error => { console.log(error); reject("Transaction error: Generating transaction. Check the recipient!") });
        });
    }

    public checkPin(pin: string): boolean {
        return this.currentAccount.value != undefined ? this.currentAccount.value.pinHash == this.hashPinStorage(pin, this.currentAccount.value.keypair.publicKey) : false;
    }

    public hashPinEncryption(pin: string): string {
        return this.cryptoService.hashSHA256(pin + device.uuid);
    }

    public hashPinStorage(pin: string, publicKey: string): string {
        return this.cryptoService.hashSHA256(pin + publicKey);
    }

    public splitBurstAddress(address: string): string[] {
        let parts: string[] = address.split("-")
        parts.shift()
        if (parts.length == 4) {
            return parts
        } else {
            return []
        }
    }

    public constructBurstAddress(parts: string[]): string {
        return "BURST-" + parts[0] + "-" + parts[1] + "-" + parts[2] + "-" + parts[3];
    }

    public isBurstcoinAddress(address: string): boolean {
        return /^BURST\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{5}/i.test(address) && BurstAddress.isValid(address);
    }

    public isPin(pin: string): boolean {
        return /^[0-9]{6}$/i.test(pin);
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
        return Promise.reject(new HttpError(error));
    }
}
