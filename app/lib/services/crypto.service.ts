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
    public generatePassPhrase(seed: any[] = []): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key and Master Private Key for a new passphrase
    * Ed25519 sign key pair. Public key can be converted to curve25519 public key (Burst Address)
    * Private Key can be converted to curve25519 private key for checking transactions
    */
    public generateMasterPublicAndPrivateKey(passPhrase: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // Hash the passphrase to get sha word array (32 bytes) which serves
            // as master seed for ed25519 key generation
            let hashedPassPhrase = CryptoJS.SHA256(passPhrase);
            // use nacl ed25519 to generate Master Public Key and Master Private Key from secret passphrase
            // https://ed25519.cr.yp.to/
            // https://nacl.cr.yp.to/
            // https://www.ietf.org/mail-archive/web/cfrg/current/msg04996.html
            let keys;
            NaCL.instantiate(nacl => { keys = nacl.crypto_sign_seed_keypair(Converter.convertWordArrayToUint8Array(hashedPassPhrase)) });
            resolve([CryptoJS.enc.Hex.stringify(Converter.convertUint8ArrayToWordArray(keys.signPk)),
                CryptoJS.enc.Hex.stringify(Converter.convertUint8ArrayToWordArray(keys.signSk))]); //[keys.signPk, keys.signSk]
        });
    }

    /*
    * Encrypt a derived hd private key with a given pin and return it in Base64 form
    */
    public encryptPrivateKeyWithPin(privateKey: string, pin: number): Promise<string> {
        return new Promise((resolve, reject) => {
            let encrypted = CryptoJS.AES.encrypt(privateKey, pin.toString());
            resolve(encrypted.toString()); // Base 64
        });
    }
    /*
    * Decrypt a derived hd private key with a given pin
    */
    public decryptPrivateKeyWithPin(encrypted: string, pin: number): Promise<string> {
        return new Promise((resolve, reject) => {
            let decrypted = CryptoJS.AES.decrypt(encrypted, pin.toString());
            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        });
    }
}
