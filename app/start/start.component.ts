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
import { PassPhraseGenerator } from "../lib/util/crypto";

@Component({
    selector: "start",
    moduleId: module.id,
    templateUrl: "./start.component.html",
    styleUrls: ["./start.component.css"]
})
export class StartComponent implements OnInit {

    constructor() {

    }

    public ngOnInit() {
        // TODO: check if wallet already exists, then redirect to tabs
    }


}
