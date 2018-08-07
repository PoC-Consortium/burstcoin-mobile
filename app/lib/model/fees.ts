
/*
* Copyright 2018 PoC-Consortium
*/

/*
* Fees class
*/
export class Fees {
    public standard: number;
    public cheap: number;
    public priority: number;

    constructor(data: any = {}) {
        this.standard = data.standard / 10000000 || undefined;
        this.cheap = data.cheap / 10000000 || undefined;
        this.priority = data.priority / 10000000 || undefined;
    }
}
