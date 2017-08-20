import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator } from "../util/crypto";

var CryptoJS = require("crypto-js");
var NaCL = require('js-nacl');

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
    public generatePassPhrase(seed = []): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key for a new passphrase
    */
    public generatePublicKey(passPhrase): Promise<string> {
        return new Promise((resolve, reject) => {
            // Hash the passphrase to gget sha word array (32 bytes)
    		let hashedPassPhrase = CryptoJS.SHA256(passPhrase);

            // use nacl curve 25519 to get Master Public Key and Master Private Key from secret passphrase
            let keys;
            NaCL.instantiate(nacl => { keys = nacl.crypto_sign_seed_keypair(Converter.convertWordArrayToUint8Array(hashedPassPhrase)) });
            resolve(CryptoJS.enc.Hex.stringify(Converter.convertUint8ArrayToWordArray(keys.signPk)));
        });
    }
}
