/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TranslateService } from 'ng2-translate';
import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

import { Account, BurstAddress } from "../../../lib/model";
import { CryptoService, NotificationService, AccountService } from "../../../lib/services";
import { ActivateService } from "../activate.service"

@Component({
    selector: "password",
    moduleId: module.id,
    templateUrl: "./password.component.html",
    styleUrls: ["./password.component.css"]
})
export class PasswordComponent implements OnInit {

    pin: string;
    passphrase: string;
    address;

    constructor(
        private accountService: AccountService,
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {
        this.address = { value: this.accountService.currentAccount.value.address }
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value.active) {
            this.router.navigateByUrl('tabs')
        }
    }

    public onTapNext() {
        if (this.passphrase.length > 0) {
            this.cryptoService.generateMasterPublicAndPrivateKey(this.passphrase)
                .then(keypair => {
                    this.cryptoService.getAccountIdFromPublicKey(keypair.publicKey)
                        .then(id => {
                            this.cryptoService.getBurstAddressFromAccountId(id)
                                .then(address => {
                                    if (this.accountService.currentAccount.value.address == address) {

                                    } else {

                                        this.translateService.get("NOTIFICATIONS.WRONG_PASSPHRASE").subscribe((res: string) => {
                                            this.notificationService.info(res);
                                        });
                                    }
                                })
                                .catch(error => {

                                    this.translateService.get("NOTIFICATIONS.ERRORS.ADDRESS").subscribe((res: string) => {
                                        this.notificationService.info(res);
                                    });
                                })
                        })
                        .catch(error => {

                            this.translateService.get("NOTIFICATIONS.ERRORS.ACCOUNT_ID").subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                })
                .catch(error => {

                    this.translateService.get("NOTIFICATIONS.ERRORS.KEYPAIR").subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                })
        } else {
            this.translateService.get("NOTIFICATIONS.ENTER_SOMETHING").subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }
}
