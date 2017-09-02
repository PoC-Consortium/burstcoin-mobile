import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from '@angular/router';
import { RouterExtensions } from "nativescript-angular/router";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";

import { Wallet } from "../lib/model";
import { DatabaseService, NotificationService, WalletService } from "../lib/services";


@Component({
    selector: "start",
    moduleId: module.id,
    templateUrl: "./start.component.html",
    styleUrls: ["./start.component.css"]
})
export class StartComponent implements OnInit {

    private loading: boolean;

    constructor(
        private databaseService: DatabaseService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private walletService: WalletService
    ) {
        this.databaseService.ready.subscribe((init: boolean) => {
            this.loadSelectedWallet(init)
        });
        // TODO: show initial loading
        this.loading = true;
    }

    private loadSelectedWallet(init) {
        if (init == true) {
            // get selected wallet from database
            this.databaseService.getSelectedWallet()
                .then(wallet => {
                    this.walletService.setCurrentWallet(wallet);
                    this.router.navigate(['tabs'], { clearHistory: true });
                })
                .catch(wallet => {
                    this.router.navigate(['import'], { clearHistory: true });
                })
        } else {
            this.loading = false;
        }
    }

    public ngOnInit() {

    }
}
