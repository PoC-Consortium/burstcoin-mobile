import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";
import { Page } from "ui/page";

import { Account } from "../lib/model";
import { AccountService, DatabaseService, NotificationService } from "../lib/services";


@Component({
    selector: "start",
    moduleId: module.id,
    templateUrl: "./start.component.html",
    styleUrls: ["./start.component.css"]
})
export class StartComponent implements OnInit {

    private loading: boolean;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private notificationService: NotificationService,
        private page: Page,
        private router: RouterExtensions
    ) {
        this.page.actionBarHidden = true;
        this.databaseService.ready.subscribe((init: boolean) => {
            this.loadSelectedAccount(init)
        });
        // TODO: show initial loading
        this.loading = true;
    }

    private loadSelectedAccount(init) {
        if (init == true) {
            // get selected account from database
            this.databaseService.getSelectedAccount()
                .then(account => {
                    this.accountService.setCurrentAccount(account);
                    this.router.navigate(['tabs'], { clearHistory: true });
                })
                .catch(account => {
                    this.loading = false;
                })
        } else {
            this.loading = false;
        }
    }

    public ngOnInit() {

    }
}
