import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator } from "../util/crypto";

let SHA256 = require("crypto-js/sha256");

@Injectable()
export class CryptoService {

    private passPhraseGenerator: PassPhraseGenerator;

    constructor() {
        this.passPhraseGenerator = new PassPhraseGenerator();
    }

    /*
    * Generate a passphrase witth the help of the PassPhraseGenerator
    * pass optional seed for seeding generation
    */
    public generatePassPhrase(seed = undefined): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key for a new passphrase
    */
    public genneratePublicKey(passPhrase): Promise<string> {
        return new Promise((resolve, reject) => {
            let secretPhraseBytes = Converter.hexStringToByteArray(passPhrase);
    		let digest = simpleHash(secretPhraseBytes);
    		resolve(Converter.byteArrayToHexString(curve25519.keygen(digest).p));
        });
    }
}
