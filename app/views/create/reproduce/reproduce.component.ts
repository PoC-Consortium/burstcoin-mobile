/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";
import { TranslateService } from 'ng2-translate';

import { CryptoService, NotificationService } from "../../../lib/services";
import { PassPhraseGenerator } from "../../../lib/util/crypto";

import { CreateService } from "../create.service"

@Component({
    selector: "reproduce",
    moduleId: module.id,
    templateUrl: "./reproduce.component.html",
    styleUrls: ["./reproduce.component.css"]
})
export class ReproduceComponent implements OnInit {


    private index: number;
    private retypePassPhrase: string[];
    private textField: TextField;
    private try: string;
    private wordnumber: any;

    constructor(
        private createService: CreateService,
        private router: RouterExtensions
    ) {
        this.index = 0;
        this.retypePassPhrase = [];
        this.try = "";
        this.wordnumber = { value: 1 };
    }

    ngOnInit(): void {

    }

    /*
    * This method is called when the onput of the textfield changes and updates
    * the shown possibilities matching the current input
    */
    public onChange(args: EventData) {
        this.textField = <TextField>args.object;
        let text = this.textField.text.toLowerCase();
        let possibilities = PassPhraseGenerator.words.filter(w => w.startsWith(text));
        if (possibilities.length >= 3) {
            this.retypePassPhrase = possibilities.slice(0, 3);
        } else {
            this.retypePassPhrase = possibilities;
        }
        if (this.textField.text == "") {
            this.retypePassPhrase = [];
        }
    }

    /*
    * This method is called if a possibility gets tapped if the tapped
    * possibility is the matching word of the passphrase then go on to the
    * next word. If all 12 words were repeated correctly go to step 5
    */
    public onTapPossibility(args: EventData) {
        let button = <Button>args.object;
        if (button.text == this.createService.getPassphrasePart(this.index)) {
            this.index++;
            this.textField.text = "";
            this.retypePassPhrase = [];
            this.try = "";
            this.wordnumber = { value: this.index + 1 };
            if (this.index >= 12) {
                // correctly retyped all 12 words
                this.createService.setProgress(3);
                this.router.navigate(['create/verify']);
            }
        }
    }
}
