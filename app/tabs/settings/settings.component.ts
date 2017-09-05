import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Border } from "ui/border";

import { Transaction, Settings, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";
import { AboutComponent } from "./about/about.component";
import { CurrencyComponent } from "./currency/currency.component";
import { NodeComponent } from "./node/node.component";

@Component({
    selector: "settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {

    private settings: Settings;

    constructor(
        private databaseService: DatabaseService,
        private modalDialogService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.settings = new Settings();
        this.settings.currency = "...";
        this.settings.node = "...";
    }

    ngOnInit(): void {
        this.databaseService.getSettings()
            .then(settings => {
                this.settings = settings;
            })
    }

    public onTapAbout() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(AboutComponent, options)
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapCurrency() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: this.settings.currency,
            fullscreen: false,
        };
        this.modalDialogService.showModal(CurrencyComponent, options)
            .then(currency => {
                if (currency != undefined && this.settings.currency != currency) {
                    this.settings.currency = currency;
                    this.databaseService.saveSettings(this.settings)
                        .then(settings => {
                            console.log(JSON.stringify(settings));
                            this.notificationService.info("Currency successfully updated!")
                        })
                        .catch(error => {
                            this.notificationService.info("Currency update failed!")
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapNode() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: this.settings.node,
            fullscreen: false,
        };
        this.modalDialogService.showModal(NodeComponent, options)
            .then(node => {
                if (node != undefined && this.settings.node != node) {
                    this.settings.node = node;
                    this.databaseService.saveSettings(this.settings)
                        .then(settings => {
                            this.notificationService.info("Node successfully updated!")
                        })
                        .catch(error => {
                            this.notificationService.info("Node update failed!")
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

}
