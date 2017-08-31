import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";

import { WalletService } from "../lib/services";

@Component({
    selector: "pin",
    moduleId: module.id,
    templateUrl: "./pin.component.html",
    styleUrls: ["./pin.component.css"]
})
export class PinComponent implements OnInit {

    type: string;
    return: string;
    pin: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private walletService: WalletService
    ) {
        this.type = this.route.snapshot.params['type'];
        this.return = decodeURIComponent(this.route.snapshot.params['return']);
        console.log(this.return);
        console.log(this.type);
        this.pin = "1111";
    }

    public ngOnInit(): void {

    }

    public onTapDone() {
        if (this.type == "verify") {
            // TODO: do Pin code verification
        } else if (this.type == "set") {
            this.router.navigate([this.return, this.pin]);
        }
    }

}
