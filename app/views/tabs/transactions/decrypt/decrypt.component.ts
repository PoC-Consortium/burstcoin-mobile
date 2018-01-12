/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, NgModule } from "@angular/core";
import { TranslateService } from "ng2-translate";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { AccountService, CryptoService, NotificationService } from "../../../../lib/services";
import { Account, EncryptedMessage, Transaction } from "../../../../lib/model";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./decrypt.component.html",
    styleUrls: ["./decrypt.component.css"]
})
export class DecryptComponent implements OnInit {

    pin: string;
    decrypted: string;
    decryptError: boolean;
    transaction: Transaction;
    account: Account;

    constructor(
        private accountService: AccountService,
        private cryptoService: CryptoService,
        private params: ModalDialogParams,
        private page: Page,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {
        this.transaction = params.context;
        this.decrypted = "-"
        this.decryptError = false;
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit() {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
        }
    }

    public onTapOk() {
        let id: string;
        if (this.transaction.recipientId == this.account.id) {
            id = this.transaction.senderId
        } else {
            id = this.transaction.recipientId
        }
        let em: EncryptedMessage = <EncryptedMessage>this.transaction.attachment;
        if (this.accountService.checkPin(this.pin)) {
            this.accountService.getAccountPublicKey(id).then(publicKey => {
                this.cryptoService.decryptMessage(em.data, em.nonce, this.account.keys.agreementPrivateKey, this.accountService.hashPinEncryption(this.pin), publicKey).then(note => {
                    if (note != undefined && note != "") {
                        this.decrypted = note;
                    } else {
                        this.decryptError = true
                        this.translateService.get('TABS.HISTORY.DECRYPT_IMPOSSIBLE').subscribe((res: string) => {
                            this.decrypted = res
                        });
                    }
                }).catch(error => {
                    this.decryptError = true
                    this.translateService.get('TABS.HISTORY.DECRYPT_IMPOSSIBLE').subscribe((res: string) => {
                        this.decrypted = res
                    });
                })
            })

        }
    }
}
