import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";

import { BurstAddress } from "../../lib/model";

@Component({
    selector: "balance",
    moduleId: module.id,
    templateUrl: "./balance.component.html",
    styleUrls: ["./balance.component.css"]
})
export class BalanceComponent implements OnInit {

    constructor() {

    }

    ngOnInit(): void {
        /* ***********************************************************
        * Use the "ngOnInit" handler to initialize data for the whole tab
        * navigation layout as a whole.
        *************************************************************/
    }

    public onTapSend(e) {

    }

    public onTapReceive(e) {

    }

    public onTapColdStorage(e) {

    }
}
