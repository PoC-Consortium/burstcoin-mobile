import {Injectable} from '@angular/core';

import { PassPhraseGenerator } from "../util/crypto";

@Injectable()
export class CryptoService {



    constructor() {

    }


    public generatePassPhrase(seed): Promise<string> {
        return new Promise((resolve, reject) => {
            let p = new PassPhraseGenerator(seed);
            resolve(p.generatePassPhrase());
        });
    }
}
