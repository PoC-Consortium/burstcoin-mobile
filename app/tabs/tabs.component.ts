import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";

import { Wallet } from "../lib/model";
import { DatabaseService, NotificationService, WalletService } from "../lib/services";

@Component({
    selector: "TabsComponent",
    moduleId: module.id,
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.css"]
})
export class TabsComponent implements OnInit {

    private _title: string;
    private selectedIndex: number;

    constructor(
        private databaseService: DatabaseService,
        private notificationService: NotificationService,
        private router: Router,
        private walletService: WalletService
    ) {

    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value == undefined) {
            this.router.navigate(['start']);
        } else {
            let wallet = this.walletService.currentWallet.value;
            this.walletService.synchronizeWallet(wallet)
                .then(wallet => {
                    this.walletService.setCurrentWallet(wallet);
                })
        }
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
        }
    }

    /* ***********************************************************
    * The "getIconSource" function returns the correct tab icon source
    * depending on whether the app is ran on Android or iOS.
    * You can find all resources in /App_Resources/os
    *************************************************************/
    getIconSource(icon: string): string {
        return isAndroid ? "res://" + icon : "res://tabIcons/" + icon;
    }

    /* ***********************************************************
    * Get the current tab view title and set it as an ActionBar title.
    * Learn more about the onSelectedIndexChanged event here:
    * https://docs.nativescript.org/cookbook/ui/tab-view#using-selectedindexchanged-event-from-xml
    *************************************************************/
    onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
        const tabView = <TabView>args.object;
        const selectedTabViewItem = tabView.items[args.newIndex];
        this.selectedIndex = args.newIndex;
        this.title = selectedTabViewItem.title;
    }
}
