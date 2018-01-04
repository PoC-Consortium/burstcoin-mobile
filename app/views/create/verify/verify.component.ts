/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";
import { TranslateService } from 'ng2-translate';

import { AccountService, CryptoService, NotificationService } from "../../../lib/services";
import { PassPhraseGenerator } from "../../../lib/util/crypto";

import { CreateService } from "../create.service"

@Component({
    selector: "verify",
    moduleId: module.id,
    templateUrl: "./verify.component.html",
    styleUrls: ["./verify.component.css"]
})
export class VerifyComponent {

    private pin: string
    private loading: boolean

    constructor(
        private accountService: AccountService,
        private createService: CreateService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {}

    public onTapDone(args: EventData) {
        if (this.accountService.isPin(this.pin)) {
            this.loading = true
            this.accountService.createActiveAccount(this.createService.getCompletePassphrase(), this.pin)
                .then(account => {
                    this.accountService.selectAccount(account)
                        .then(account => {
                            this.router.navigate(['tabs'], { clearHistory: true });
                        })
                })
                .catch(err => {
                    this.router.navigate(['start'], { clearHistory: true });
                })
        } else {
            this.translateService.get("NOTIFICATIONS.PIN").subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }
}
