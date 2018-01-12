/*
* Copyright 2018 PoC-Consortium
*/

import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class TabsService {
    public index: BehaviorSubject<any> = new BehaviorSubject(undefined);

    constructor() {

    }

    public changeTab(index: number) {
        this.index.next(index);
    }
}
