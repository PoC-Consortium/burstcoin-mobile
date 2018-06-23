/*
* Copyright 2018 PoC-Consortium
*/

import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { device } from "platform";
import { BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';

import { Account, BurstAddress, Currency, EncryptedMessage, HttpError, Keys, Message, Settings, Transaction, constants } from "../model";
import { NoConnectionError, UnknownAccountError } from "../model/error";
import { CryptoService, DatabaseService, NotificationService} from "./";

/*
* AccountService class
*
* The AccountService is responsible for communication with the Burst node.
* It also preserves the current selected account and shares account related information
* across components.
*/
@Injectable()
export class AccountService {
    private nodeUrl: string;

    // Behaviour Subject for the current selected account, can be subscribed by components
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

    /*
    * Method responsible for creating a new active account from a passphrase.
    * Generates keys for an account, encrypts them with the provided key and saves them.
    * TODO: error handling of asynchronous method calls
    */
    public createActiveAccount(passphrase: string, pin: string = ""): Promise<Account> {
        return new Promise((resolve, reject) => {
            let account: Account = new Account();
            // import active account
            account.type = "active";
            return this.cryptoService.generateMasterKeys(passphrase)
                .then(keys => {
                    let newKeys = new Keys();
                    newKeys.publicKey = keys.publicKey;
                    return this.cryptoService.encryptAES(keys.signPrivateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            newKeys.signPrivateKey = encryptedKey;
                            return this.cryptoService.encryptAES(keys.agreementPrivateKey, this.hashPinEncryption(pin))
                                .then(encryptedKey => {
                                    newKeys.agreementPrivateKey = encryptedKey;
                                    account.keys = newKeys;
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

    /*
    * Method responsible for importing an offline account.
    * Creates an account object with no keys attached.
    */
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

    /*
    * Method responsible for activating an offline account.
    * This method adds keys to an existing account object and enables it.
    */
    public activateAccount(account: Account, passphrase: string, pin: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.cryptoService.generateMasterKeys(passphrase)
                .then(keys => {
                    let newKeys = new Keys();
                    newKeys.publicKey = keys.publicKey;
                    return this.cryptoService.encryptAES(keys.signPrivateKey, this.hashPinEncryption(pin))
                        .then(encryptedKey => {
                            newKeys.signPrivateKey = encryptedKey;
                            return this.cryptoService.encryptAES(keys.agreementPrivateKey, this.hashPinEncryption(pin))
                                .then(encryptedKey => {
                                    newKeys.agreementPrivateKey = encryptedKey;
                                    account.keys = newKeys;
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

    /*
    * Method responsible for removing an existing account.
    */
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

    /*
    * Method responsible for synchronizing an account with the blockchain.
    */
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

    /*
    * Method responsible for selecting a different account.
    */
    public selectAccount(account: Account): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.databaseService.selectAccount(account)
                .then(account => { })
            this.setCurrentAccount(account);
            resolve(account);
        });
    }

    /*
    * Method responsible for getting the latest 15 transactions.
    */
    public getTransactions(id: string): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getAccountTransactions");
            params.set("firstIndex", "0");
            params.set("lastIndex", constants.transactionCount);
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
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

    /*
    * Method responsible for getting yet unconfirmed transactions.
    */
    public getUnconfirmedTransactions(id: string): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getUnconfirmedTransactions");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
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

    /*
    * Method responsible for getting one specific transaction
    */
    public getTransaction(id: string): Promise<Transaction> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getTransaction");
            params.set("transaction", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
                .then(response => {
                    return response.json() || [];
                })
                .catch(error => reject(new NoConnectionError()));
        });
    }

    /*
    * Method responsible for getting the current balance of an account.
    */
    public getBalance(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getBalance");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
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

    /*
    * Method responsible for getting the public key in the blockchain of an account.
    */
    public getAccountPublicKey(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "getAccountPublicKey");
            params.set("account", id);
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
                .then(response => {
                    if (response.json().publicKey != undefined) {
                        let publicKey = response.json().publicKey;
                        resolve(response.json().publicKey);
                    } else {
                        reject(new UnknownAccountError())
                    }
                })
                .catch(error => reject(new NoConnectionError()));
        });
    }

    /*
    * Method responsible for executing a transaction.
    * TODO: very bloated, maybe 'un'bloat
    */
    public doTransaction(transaction: Transaction, encryptedPrivateKey: string, pin: string): Promise<Transaction> {
        return new Promise((resolve, reject) => {
            let unsignedTransactionHex, sendFields, broadcastFields, transactionFields;
            let params: URLSearchParams = new URLSearchParams();
            params.set("requestType", "sendMoney");
            params.set("amountNQT", this.convertNumberToString(transaction.amountNQT));
            params.set("deadline", "1440");
            params.set("feeNQT", this.convertNumberToString(transaction.feeNQT));
            params.set("publicKey", transaction.senderPublicKey);
            params.set("recipient", transaction.recipientAddress);
            if (transaction.attachment != undefined) {
                if (transaction.attachment.type == "encrypted_message") {
                    let em: EncryptedMessage = <EncryptedMessage> transaction.attachment;
                    params.set("encryptedMessageData", em.data);
                    params.set("encryptedMessageNonce", em.nonce);
                    params.set("messageToEncryptIsText", String(em.isText));
                } else if (transaction.attachment.type == "message") {
                    let m: Message = <Message> transaction.attachment;
                    params.set("message", m.message)
                    params.set("messageIsText", String(m.messageIsText))
                }
            }
            let requestOptions = this.getRequestOptions();
            requestOptions.params = params;
            // request 'sendMoney' to burst node
            return this.http.post(this.nodeUrl, {}, requestOptions).timeout(constants.connectionTimeout).toPromise()
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
                                                    return this.http.post(this.nodeUrl, {}, requestOptions).timeout(constants.connectionTimeout).toPromise()
                                                        .then(response => {
                                                            params = new URLSearchParams();
                                                            params.set("requestType", "getTransaction");
                                                            params.set("transaction", response.json().transaction);
                                                            requestOptions = this.getRequestOptions();
                                                            requestOptions.params = params;
                                                            // request 'getTransaction' to burst node
                                                            return this.http.get(this.nodeUrl, requestOptions).timeout(constants.connectionTimeout).toPromise()
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
                }).catch(error => { console.log(error); reject("Transaction error: Generating transaction. Check the recipient!") });
        });
    }

    /*
    * Method responsible for verifying the PIN
    */
    public checkPin(pin: string): boolean {
        return this.currentAccount.value != undefined ? this.currentAccount.value.pinHash == this.hashPinStorage(pin, this.currentAccount.value.keys.publicKey) : false;
    }

    /*
    * Method responsible for hashing the PIN to carry out an ecryption.
    */
    public hashPinEncryption(pin: string): string {
        return this.cryptoService.hashSHA256(pin + device.uuid);
    }

    /*
    * Method responsible for hashing the PIN for saving it into the database.
    */
    public hashPinStorage(pin: string, publicKey: string): string {
        return this.cryptoService.hashSHA256(pin + publicKey);
    }

    /*
    * Method responsible for pin validation.
    */
    public isPin(pin: string): boolean {
        return /^[0-9]{6}$/i.test(pin);
    }

    /*
    * Helper method to handle NQT
    */
    public convertStringToNumber(str, value = ".", position = 8) {
        return str.substring(0, str.length - position) + value + str.substring(str.length - position);
    }

    /*
    * Helper method to Number to String(8 decimals) representation
    */
    public convertNumberToString(n: number) {
        return parseFloat(n.toString()).toFixed(8).replace(".", "");
    }

    /*
    * Helper method to construct request options
    */
    public getRequestOptions(fields = {}) {
        let headers = new Headers(fields);
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    /*
    * Helper method to handle HTTP error
    */
    private handleError(error: Response | any) {
        return Promise.reject(new HttpError(error));
    }
}
