import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator } from "../util/crypto";
import { BurstAddress } from "../model";

let CryptoJS = require("crypto-js");
let NaCL = require('js-nacl');
let bigInt = require("big-integer");

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
    *   Convert the hex string of the public key to the account id
    */
    public getAccountIdFromPublicKey(publicKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // hash with SHA 256
            let hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            let bytes = Converter.convertWordArrayToByteArray(hash);
            // slice away first 8 bytes of SHA256 string
            let slice = bytes.slice(0, 8);
            // order it from lowest bit to highest / little-endian first / reverse
            slice = slice.reverse();
            // convert each byte into a number in base 10
            let numbers = slice.map(byte => byte.toString(10));
            // create a biginteger based on the reversed byte/number array
            let id = bigInt.fromArray(numbers, 256); // base 256 for byte
            resolve(id.toString());
        });
    }

    /*
    *
    */
    public getBurstAddressFromAccountId(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstAddress.encode(id));
        });
    }

    /*
    * Encrypt a derived hd private key with a given pin and return it in Base64 form
    */
    public encryptAES(text: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let encrypted = CryptoJS.AES.encrypt(text, key);
            resolve(encrypted.toString()); // Base 64
        });
    }
    /*
    * Decrypt a derived hd private key with a given pin
    */
    public decryptAES(encryptedBase64: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        });
    }

}
