/*
    Burst Address class @author cgebe
*/

let bigInt = require('big-integer');

export class BurstAddress {

    private static readonly initialCodeWord = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private static readonly gexp: number[] = [1, 2, 4, 8, 16, 5, 10, 20, 13, 26, 17, 7, 14, 28, 29, 31, 27, 19, 3, 6, 12, 24, 21, 15, 30, 25, 23, 11, 22, 9, 18, 1];
    private static readonly glog: number[] = [0, 0, 1, 18, 2, 5, 19, 11, 3, 29, 6, 27, 20, 8, 12, 23, 4, 10, 30, 17, 7, 22, 28, 26, 21, 25, 9, 16, 13, 14, 24, 15];
    private static readonly cwmap: number[] = [3, 2, 1, 0, 7, 6, 5, 4, 13, 14, 15, 16, 12, 8, 9, 10, 11];
    private static readonly alphabet: string[] = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
    private static readonly base32Length = 13;
    private static readonly two64 = bigInt("18446744073709551616");

    private syndrome: number[];
    private guess: string[];

    constructor() {

        this.syndrome = [0, 0, 0, 0, 0];
        this.guess = [];
    }

    private static ginv(a) {
        return BurstAddress.gexp[31 - BurstAddress.glog[a]];
    }

    private static gmult(a, b) {
        if (a == 0 || b == 0) return 0;

        let idx = (BurstAddress.glog[a] + BurstAddress.glog[b]) % 31;

        return BurstAddress.gexp[idx];
    }

    public static encode(plain: string): string {
        let plainString10 = [],
            codeword = [],
            pos = 0;

        let plainString = bigInt(plain).add(BurstAddress.two64).toString();
        let length = plainString.length;

        for (let i = 0; i < length; i++) {
            plainString10[i] = plainString.charCodeAt(i) - '0'.charCodeAt(0);
        }
        
        let digit32 = 0,
            newLength = 0;
        do // base 10 to base 32 conversion
        {
            digit32 = 0;
            newLength = 0;
            for (let i = 0; i < length; i++) {
                digit32 = digit32 * 10 + plainString10[i];
                if (digit32 >= 32) {
                    plainString10[newLength] = digit32 >> 5;
                    digit32 &= 31;
                    newLength++;
                } else if (newLength > 0) {
                    plainString10[newLength] = 0;
                    newLength++;
                }
            }

            length = newLength;
            codeword[pos] = digit32;
            pos++;
        }
        while (length > 0);

        let p = [0, 0, 0, 0];

        for (let i = BurstAddress.base32Length - 1; i >= 0; i--) {
            let fb = codeword[i] ^ p[3];

            p[3] = p[2] ^ BurstAddress.gmult(30, fb);
            p[2] = p[1] ^ BurstAddress.gmult(6, fb);
            p[1] = p[0] ^ BurstAddress.gmult(9, fb);
            p[0] = BurstAddress.gmult(17, fb);
        }

        codeword[13] = p[0];
        codeword[14] = p[1];
        codeword[15] = p[2];
        codeword[16] = p[3];

        let out = 'BURST-';

        for (let i = 0; i < 17; i++) {
            out += BurstAddress.alphabet[codeword[BurstAddress.cwmap[i]]];

            if ((i & 3) == 3 && i < 13) out += '-';
        }

        return out;
    }
}
