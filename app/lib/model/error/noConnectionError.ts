
export class NoConnectionError extends Error {
    constructor(m: string = "Failed fetching data. Check your internet connection!") {
        super(m);

        Object.setPrototypeOf(this, NoConnectionError.prototype);
    }

    public toString() {
        return this.message;
    }
}
