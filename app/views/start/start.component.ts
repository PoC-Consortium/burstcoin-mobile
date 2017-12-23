/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TranslateService } from 'ng2-translate';
import { device } from "platform";
import { Page } from "ui/page";

import { Account } from "../../lib/model";
import { AccountService, DatabaseService, NotificationService } from "../../lib/services";

@Component({
    selector: "start",
    moduleId: module.id,
    templateUrl: "./start.component.html",
    styleUrls: ["./start.component.css"]
})
export class StartComponent implements OnInit {

    loading: boolean;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private notificationService: NotificationService,
        private page: Page,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {
        this.page.actionBarHidden = true;
        this.databaseService.ready.subscribe((init: boolean) => {
            this.loadSelectedAccount(init)
            this.setLanguage(init);
        });
        // TODO: show initial loading
        this.loading = true;
    }

    private loadSelectedAccount(init: boolean) {
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

    private setLanguage(init: boolean) {
        // fallback language
        this.translateService.setDefaultLang('en');
        if (init == true) {
            this.databaseService.getSettings().then(settings => {
                this.translateService.use(settings.language);
            })
        } else {
            this.translateService.use(device.language);
        }
    }


    public ngOnInit() {

    }
}
