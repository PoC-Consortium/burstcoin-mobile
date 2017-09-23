
export class UnknownAccountError extends Error {
    constructor(m: string = "Account is still unknown! No transactions yet!") {
        super(m);

        Object.setPrototypeOf(this, UnknownAccountError.prototype);
    }

    public toString() {
        return this.message;
    }
}
