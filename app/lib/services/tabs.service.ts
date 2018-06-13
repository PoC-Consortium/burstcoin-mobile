/*
* Copyright 2018 PoC-Consortium
*/

import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

/*
* TabsService class
*
* Helper method for tabs component. Right now only for swtiching tabs on dead swipe area.
* Workaround: https://github.com/cgebe/burst-pocket/issues/27
*/
@Injectable()
export class TabsService {
    public index: BehaviorSubject<any> = new BehaviorSubject(undefined);

    public changeTab(index: number) {
        this.index.next(index);
    }
}
