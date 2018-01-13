/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { TranslateService } from 'ng2-translate';
import { SwipeGestureEventData } from "ui/gestures";

import { Account, Transaction, Settings } from "../../../lib/model";

import { AccountService, DatabaseService, MarketService, NotificationService, TabsService } from "../../../lib/services";
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
    private languageNames: string[] = ["Deutsch", "Ελληνικά", "English", "Español", "Français", "हिन्दी", "Italiano", "한국어", "Magyar", "Nederlands", "Polski", "Pу́сский", "Slovensky", "Svenska", "தமிழ", "中文"]
    private languages: string[] = ["de", "el", "en", "es", "fr", "hi", "it", "ko", "hu", "nl", "pl", "ru", "sk", "sv", "ta", "zh"]

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private tabsService: TabsService,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.settings = new Settings();
        this.settings.currency = "...";
        this.settings.node = "...";
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
                                    this.translateService.get('NOTIFICATIONS.UPDATE_CURRENCY').subscribe((res: string) => {
                                        this.notificationService.info(res);
                                    });
                                })
                                .catch(error => {
                                    this.translateService.get('NOTIFICATIONS.ERRORS.CURRENCY').subscribe((res: string) => {
                                        this.notificationService.info(res);
                                    });
                                })
                        })
                        .catch(error => {
                            this.translateService.get('NOTIFICATIONS.ERRORS.CURRENCY').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapLanguage() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: this.settings.language,
            fullscreen: false,
        };
        this.modalDialogService.showModal(LanguageComponent, options)
            .then(language => {
                if (language != undefined && this.settings.language != language) {
                    this.settings.language = language;
                    this.databaseService.saveSettings(this.settings)
                        .then(settings => {
                            this.translateService.use(language.toLowerCase());
                            this.translateService.get('NOTIFICATIONS.UDPDATE_LANGUAGE').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                        .catch(error => {
                            this.translateService.get('NOTIFICATIONS.ERRORS.LANGUAGE').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapDocumentation() {
        utils.openUrl("https://poc-consortium.github.io/burstcoin-mobile-doc/");
    }

    public onSwipeItem(args: SwipeGestureEventData) {
        if (args.direction == 1) {
            this.tabsService.changeTab(2);
        }
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
                            this.translateService.get('NOTIFICATIONS.UPDATE_NODE').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                        .catch(error => {
                            this.translateService.get('NOTIFICATIONS.ERRORS.NODE').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

}
