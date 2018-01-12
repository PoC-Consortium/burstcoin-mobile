/*
* Copyright 2018 PoC-Consortium
*/

import { Injectable } from "@angular/core";
import { SnackBar } from "nativescript-snackbar";

/*
* NotificaitionService class
*
* Easy generaton of notifications.
*/
@Injectable()
export class NotificationService {
    private snackbar: SnackBar;

    constructor() {
        this.snackbar = new SnackBar();
    }

    public error(error: string): void {
        this.snackbar.simple(error, "#9d0416", "#fefcf8");
    }

    public info(message: string) {
        this.snackbar.simple(message, "#000027", "#fefcf8");
    }
}
