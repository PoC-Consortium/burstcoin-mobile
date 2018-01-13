/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TranslateService } from 'ng2-translate';
import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

import { Account } from "../../../lib/model";
import { CryptoService, NotificationService, AccountService } from "../../../lib/services";
import { ActivateService } from "../activate.service"

@Component({
    selector: "pin",
    moduleId: module.id,
    templateUrl: "./pin.component.html",
    styleUrls: ["./pin.component.css"]
})
export class PinComponent implements OnInit {
    private pin: string;
    private loading: boolean;

    constructor(
        private accountService: AccountService,
        private activateService: ActivateService,
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.loading = false;
    }

    public onTapDone() {
        if (this.accountService.isPin(this.pin)) {
            this.loading = true;
            this.accountService.activateAccount(this.accountService.currentAccount.value, this.activateService.getPassphrase(), this.pin)
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
                    this.loading = false;
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
