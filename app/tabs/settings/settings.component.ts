import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Border } from "ui/border";

import { Transaction, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";
import { AboutComponent } from "./about/about.component";

@Component({
    selector: "settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {

    constructor(
        private databaseService: DatabaseService,
        private modalDialogService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {

    }

    ngOnInit(): void {

    }

    public onTapAbout() {
        const today = new Date();
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: today.toDateString(),
            fullscreen: false,
        };
        this.modalDialogService.showModal(AboutComponent, options)
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

}
