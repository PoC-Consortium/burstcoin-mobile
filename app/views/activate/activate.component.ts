/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TranslateService } from 'ng2-translate';
import { Account, BurstAddress } from "../../lib/model";
import { CryptoService, NotificationService, AccountService } from "../../lib/services";

import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

@Component({
    selector: "activate",
    moduleId: module.id,
    templateUrl: "./activate.component.html",
    styleUrls: ["./activate.component.css"]
})
export class ActivateComponent implements OnInit {

    pin: string;
    passphrase: string;
    step: number;
    address;

    constructor(
        private accountService: AccountService,
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {
        this.step = 1;
        this.passphrase = "";
        this.address = { value: this.accountService.currentAccount.value.address }
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value.active) {
            this.router.navigateByUrl('tabs')
        }
    }

    public onTapNext() {
        if (this.passphrase.length > 0) {
            this.step = 0;
            this.cryptoService.generateMasterKeys(this.passphrase)
                .then(keypair => {
                    this.cryptoService.getAccountIdFromPublicKey(keypair.publicKey)
                        .then(id => {
                            this.cryptoService.getBurstAddressFromAccountId(id)
                                .then(address => {
                                    if (this.accountService.currentAccount.value.address == address) {
                                        this.step = 2;
                                    } else {
                                        this.step = 1;
                                        this.translateService.get("NOTIFICATIONS.WRONG_PASSPHRASE").subscribe((res: string) => {
                                            this.notificationService.info(res);
                                        });
                                    }
                                })
                                .catch(error => {
                                    this.step = 1;
                                    this.translateService.get("NOTIFICATIONS.ERRORS.ADDRESS").subscribe((res: string) => {
                                        this.notificationService.info(res);
                                    });
                                })
                        })
                        .catch(error => {
                            this.step = 1;
                            this.translateService.get("NOTIFICATIONS.ERRORS.ACCOUNT_ID").subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                })
                .catch(error => {
                    this.step = 1;
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

    public onTapDone() {
        if (this.accountService.isPin(this.pin)) {
            this.accountService.activateAccount(this.accountService.currentAccount.value, this.passphrase, this.pin)
                .then(account => {
                    this.accountService.synchronizeAccount(this.accountService.currentAccount.value)
                        .then(account => {
                            this.accountService.setCurrentAccount(account);
                            this.router.navigateByUrl('tabs')
                        })
                        .catch(error  => {
                            this.accountService.setCurrentAccount(account);
                            this.router.navigateByUrl('tabs')
                        })
                })
                .catch(error  => {
                    this.translateService.get("NOTIFICATIONS.ERRORS.UPDATE").subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                    this.router.navigateByUrl('tabs')
                })
        } else {
            this.translateService.get("NOTIFICATIONS.PIN").subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }
}
