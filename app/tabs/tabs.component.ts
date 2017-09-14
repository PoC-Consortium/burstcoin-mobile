import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";

import { Account } from "../lib/model";
import { AccountService, DatabaseService, NotificationService, TabsService } from "../lib/services";

import { NoteComponent } from "./note/note.component";

@Component({
    selector: "TabsComponent",
    moduleId: module.id,
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.css"]
})
export class TabsComponent implements OnInit {

    @ViewChild('tabs') tabView;
    private _title: string;
    private selectedIndex: number;

    constructor(
        private databaseService: DatabaseService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private vcRef: ViewContainerRef,
        private accountService: AccountService,
        private tabsService: TabsService
    ) {

    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value == undefined) {
            this.router.navigate(['start']);
        } else {
            let account = this.accountService.currentAccount.value;
            this.accountService.synchronizeAccount(account)
                .then(account => {
                    this.accountService.setCurrentAccount(account);
                    //this.showNotes();
                })
                .catch(account => {
                    this.accountService.setCurrentAccount(account);
                    //this.showNotes();
                    //this.notificationService.info("Failed synchronization. Check your internet connection!")
                })

            // listen to tabs service for programmatically changed index
            this.tabsService.index.subscribe((index: number) => {
                if (index != undefined) {
                    this.tabView.nativeElement.selectedIndex = index;
                }
            });
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

    public showNotes() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(NoteComponent, options)
            .then(node => {})
            .catch(error => {});
    }

}
