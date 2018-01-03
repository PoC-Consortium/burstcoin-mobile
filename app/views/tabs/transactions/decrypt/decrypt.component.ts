/*
    Copyright 2017 icewave.org
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
        let pk: string;
        if (this.transaction.recipientPublicKey == this.account.keys.publicKey) {
            pk = this.transaction.senderPublicKey
        } else {
            pk = this.transaction.recipientPublicKey
        }
        let em: EncryptedMessage = <EncryptedMessage> this.transaction.attachment;
        this.cryptoService.decryptNote(em.data, em.nonce, this.account.keys.agreementPrivateKey, this.accountService.hashPinEncryption(this.pin), pk).then(note => {
            this.decrypted = note;
        })
    }
}
