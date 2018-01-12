/*
* Copyright 2018 PoC-Consortium
*/

/*
* NoConnectionError class
*
* Thrown when the connection to Burst node or coinmarketcap.com is not possible.
*/
export class NoConnectionError extends Error {
    constructor(m: string = "NOTIFICATIONS.ERRORS.CONNECTION") {
        super(m);
        Object.setPrototypeOf(this, NoConnectionError.prototype);
    }

    public toString() {
        return this.message;
    }
}
