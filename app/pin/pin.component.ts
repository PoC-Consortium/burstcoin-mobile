import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";

import { CryptoService } from "../lib/services";

@Component({
    selector: "register",
    moduleId: module.id,
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.css"]
})
export class PinComponent implements OnInit {

    constructor() {

    }

    public ngOnInit(): void {

    }


}
