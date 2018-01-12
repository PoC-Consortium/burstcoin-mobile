/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TranslateService } from 'ng2-translate';
import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

import { Account, BurstAddress } from "../../../lib/model";
import { CryptoService, NotificationService, AccountService } from "../../../lib/services";
import { ActivateService } from "../activate.service"

@Component({
    selector: "pin",
    moduleId: module.id,
    templateUrl: "./pin.component.html",
    styleUrls: ["./pin.component.css"]
})
export class PinComponent implements OnInit {

    pin: string;

    constructor(
        private accountService: AccountService,
        private activateService: ActivateService,
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {

    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value.active) {
            this.router.navigateByUrl('tabs')
        }
    }

    public onTapDone() {
        if (this.accountService.isPin(this.pin)) {
            this.accountService.activateAccount(this.accountService.currentAccount.value, this.activateService.getPassword(), this.pin)
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
