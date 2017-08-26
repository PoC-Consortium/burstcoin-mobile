import { Injectable } from "@angular/core";
import { SnackBar, SnackBarOptions } from "nativescript-snackbar";

@Injectable()
export class NotificationService {
    private snackbar: SnackBar;

    infoOptions: SnackBarOptions;

    constructor() {
        this.snackbar = new SnackBar();
    }

    public error(error: string): void {
        let options: SnackBarOptions = {
            actionText: "OK",
            actionTextColor: '#ff4081',
            snackText: error,
            hideDelay: 5000,
            textColor: '#346db2', // Optional, Android only
            backgroundColor: '#eaeaea' // Optional, Android only
        };
        this.snackbar.action(options);
    }

    public info(message: string) {
        let options: SnackBarOptions = {
            actionText: "OK",
            actionTextColor: '#ff4081',
            snackText: message,
            hideDelay: 3500,
            textColor: '#346db2',
            backgroundColor: '#eaeaea'
        };
        this.snackbar.action(options);
    }
}
