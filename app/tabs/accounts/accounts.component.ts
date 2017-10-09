import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid } from "platform";
import { SwipeGestureEventData } from "ui/gestures";
import { Label } from "ui/label";
import { Image } from "ui/image";
import { TranslateService } from 'ng2-translate';

import { Account, BurstAddress, Currency } from "../../lib/model";
import { NoConnectionError } from "../../lib/model/error";
import { AccountService, DatabaseService, MarketService, NotificationService, TabsService } from "../../lib/services";
import { AddComponent } from "./add/add.component";
import { RemoveComponent } from "./remove/remove.component";

import * as SocialShare from "nativescript-social-share";

@Component({
    selector: "accounts",
    moduleId: module.id,
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.css"]
})
export class AccountsComponent implements OnInit {

    accounts: Account[];

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private tabsService: TabsService,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
    ) {
        this.accounts = [];
    }

    ngOnInit(): void {
        this.databaseService.getAllAccounts()
            .then(accounts => {
                this.accounts = accounts;
            })
            .catch(err => {
                console.log("No accounts found: " + err);
            })

        this.accountService.currentAccount.subscribe((account: Account) => {
            if (account != undefined) {
                this.accounts.filter(acc => acc.id == account.id).map(acc => {
                    acc.balance = account.balance;
                })
            }
        });
    }

    public selectAccount(account: Account) {
        this.translateService.get('NOTIFICATIONS.SELECTED', {value: account.address}).subscribe((res: string) => {
            this.notificationService.info(res);
        });
        this.accounts.find(a => a.selected).selected = false;
        this.accountService.selectAccount(account)
            .then(account => {
                this.marketService.setCurrency(this.marketService.currency.value);
            })
    }

    public onTapAddAccount() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(AddComponent, options)
            .then(result => { })
            .catch(error => { });
    }

    public onLongPress(address: string) {
        SocialShare.shareText(address);
    }

    public onTapRemoveAccount(account: Account) {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: account,
            fullscreen: false,
        };
        this.modalDialogService.showModal(RemoveComponent, options)
            .then(ok => {
                if (ok) {
                    let index = this.accounts.indexOf(account);
                    if (index > -1) {
                       this.accounts.splice(index, 1);
                    }
                    if (this.accounts.length < 1) {
                        this.router.navigate(['start'], { clearHistory: true });
                        return;
                    } else {
                        if (account.selected == true) {
                            this.accountService.selectAccount(this.accounts[0])
                                .then(selected => {
                                    this.marketService.setCurrency(this.marketService.currency.value);
                                    this.translateService.get("NOTIFICATIONS.REMOVE").subscribe((res: string) => {
                                        this.notificationService.info(res);
                                    });
                                })
                        } else {
                            this.translateService.get("NOTIFICATIONS.REMOVE").subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        }
                    }
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onSwipeItem(args: SwipeGestureEventData) {
        if (args.direction == 1) {
            this.tabsService.changeTab(1);
        } else if (args.direction == 2) {
            this.tabsService.changeTab(3);
        }
    }

    public refresh(args) {
        let listView = args.object;
        for (let i = 0; i < this.accounts.length; i++) {
            this.accountService.synchronizeAccount(this.accounts[i])
                .then(account => {
                    if (i == this.accounts.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                listView.notifyPullToRefreshFinished();
                            })
                            .catch(error => {
                                listView.notifyPullToRefreshFinished();
                                this.translateService.get(error.message).subscribe((res: string) => {
                                    this.notificationService.info(res);
                                });
                            });
                    }
                })
                .catch(error => {
                    if (error instanceof NoConnectionError) {
                        listView.notifyPullToRefreshFinished();
                        this.translateService.get(error.message).subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                        return;
                    }
                    if (i == this.accounts.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                listView.notifyPullToRefreshFinished();
                            })
                            .catch(error => {
                                listView.notifyPullToRefreshFinished();
                                this.translateService.get(error.message).subscribe((res: string) => {
                                    this.notificationService.info(res);
                                });
                            })
                    }
                })
        }
    }


}
