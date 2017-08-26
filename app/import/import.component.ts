import { Component, OnInit } from "@angular/core";
import { Switch } from "ui/switch";

@Component({
    selector: "import",
    moduleId: module.id,
    templateUrl: "./import.component.html",
    styleUrls: ["./import.component.css"]
})
export class ImportComponent implements OnInit {

    private state: string;
    private hint: string;
    private offline: boolean;

    constructor() {
        this.state = "Active";
        this.hint = "Passphrase";
        this.offline = false;

    }

    public ngOnInit() {
        // TODO: check if wallet already exists, then redirect to tabs
    }

    public onChecked(args) {
        let toggle = <Switch>args.object;
        if (toggle.checked) {
            this.state = "Active";
            this.hint = "Passphrase";
            this.offline = false;
        } else {
            this.state = "Offline";
            this.hint = "Burst address";
            this.offline = true;
        }
    }

}
