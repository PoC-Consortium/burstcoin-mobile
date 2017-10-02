import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { TranslateService } from 'ng2-translate';

import { Account, Transaction, Settings } from "../../lib/model";

import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";
import { AboutComponent } from "./about/about.component";
import { CurrencyComponent } from "./currency/currency.component";
import { LanguageComponent } from "./language/language.component";
import { NodeComponent } from "./node/node.component";
import { SupportComponent } from "./support/support.component";

import * as utils from "utils/utils";

@Component({
    selector: "settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {

    private settings: Settings;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
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
            .then(result => {})
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapSupport() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(SupportComponent, options)
            .then(result => {})
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
                            this.marketService.updateCurrency()
                                .then(currency => {
                                    this.notificationService.info("Currency successfully updated!")
                                })
                                .catch(error => {
                                    this.notificationService.info("Currency update failed!")
                                })
                        })
                        .catch(error => {
                            this.notificationService.info("Currency update failed!")
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapLanguage() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: this.settings.currency,
            fullscreen: false,
        };
        this.modalDialogService.showModal(LanguageComponent, options)
            .then(language => {
                if (language != undefined && this.settings.language != language) {
                    this.settings.language = language;
                    this.databaseService.saveSettings(this.settings)
                        .then(settings => {
                            this.translateService.use(language.toLowerCase());
                            this.notificationService.info("Language successfully updated!")
                        })
                        .catch(error => {
                            this.notificationService.info("Language change failed!")
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapDocumentation() {
        utils.openUrl("https://cgebe.github.io/burstcoin-wallet/");
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
                            this.databaseService.setSettings(settings);
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
