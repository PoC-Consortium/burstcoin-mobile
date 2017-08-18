/*
    Burst Address class @author cgebe
*/

export class BurstAddress {

    private static readonly gexp: number[] = [1, 2, 4, 8, 16, 5, 10, 20, 13, 26, 17, 7, 14, 28, 29, 31, 27, 19, 3, 6, 12, 24, 21, 15, 30, 25, 23, 11, 22, 9, 18, 1];
    private static readonly glog: number[] = [0, 0, 1, 18, 2, 5, 19, 11, 3, 29, 6, 27, 20, 8, 12, 23, 4, 10, 30, 17, 7, 22, 28, 26, 21, 25, 9, 16, 13, 14, 24, 15];
    private static readonly cwmap: number[] = [3, 2, 1, 0, 7, 6, 5, 4, 13, 14, 15, 16, 12, 8, 9, 10, 11];
    private static readonly alphabet: string[] = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');

    private codeword: number[];
    private syndrome: number[];
    private guess: string[];

    constructor() {
        this.codeword = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

    private calculateDiscrepancy(lambda, r) {
        let discr = 0;

        for (let i = 0; i < r; i++) {
            discr ^= BurstAddress.gmult(lambda[i], this.syndrome[r - i]);
        }

        return discr;
    }

    private findErrors(lambda) {
        let errloc = [];

        for (let i = 1; i <= 31; i++) {
            let sum = 0;

            for (let j = 0; j < 5; j++) {
                sum ^= BurstAddress.gmult(BurstAddress.gexp[(j * i) % 31], lambda[j]);
            }

            if (sum == 0) {
                let pos = 31 - i;
                if (pos > 12 && pos < 27) return [];

                errloc[errloc.length] = pos;
            }
        }

        return errloc;
    }

    private guessErrors() {
        let el = 0,
            b = [0, 0, 0, 0, 0],
            t = [];

        let deg_lambda = 0,
            lambda = [1, 0, 0, 0, 0]; // error+erasure locator poly

        // Berlekamp-Massey algorithm to determine error+erasure locator polynomial

        for (let r = 0; r < 4; r++) {
            let discr = this.calculateDiscrepancy(lambda, r + 1); // Compute discrepancy at the r-th step in poly-form

            if (discr != 0) {
                deg_lambda = 0;

                for (let i = 0; i < 5; i++) {
                    t[i] = lambda[i] ^ BurstAddress.gmult(discr, b[i]);

                    if (t[i]) deg_lambda = i;
                }

                if (2 * el <= r) {
                    el = r + 1 - el;

                    for (let i = 0; i < 5; i++) {
                        b[i] = BurstAddress.gmult(lambda[i], BurstAddress.ginv(discr));
                    }
                }

                lambda = t.slice(); // copy
            }

            b.unshift(0); // shift => mul by x
        }

        // Find roots of the locator polynomial.

        let errloc = this.findErrors(lambda);

        let errors = errloc.length;

        if (errors < 1 || errors > 2) return false;

        if (deg_lambda != errors) return false; // deg(lambda) unequal to number of roots => uncorrectable error

        // Compute err+eras evaluator poly omega(x) = s(x)*lambda(x) (modulo x**(4)). Also find deg(omega).

        let omega = [0, 0, 0, 0, 0];

        for (let i = 0; i < 4; i++) {
            let t = 0;

            for (let j = 0; j < i; j++) {
                t ^= BurstAddress.gmult(this.syndrome[i + 1 - j], lambda[j]);
            }

            omega[i] = t;
        }

        // Compute error values in poly-form.

        for (let r = 0; r < errors; r++) {
            let t = 0;
            let pos = errloc[r];
            let root = 31 - pos;

            for (let i = 0; i < 4; i++) // evaluate Omega at alpha^(-i)
            {
                t ^= BurstAddress.gmult(omega[i], BurstAddress.gexp[(root * i) % 31]);
            }

            if (t) // evaluate Lambda' (derivative) at alpha^(-i); all odd powers disappear
            {
                let denom = BurstAddress.gmult(lambda[1], 1) ^ BurstAddress.gmult(lambda[3], BurstAddress.gexp[(root * 2) % 31]);

                if (denom == 0) return false;

                if (pos > 12) pos -= 14;

                this.codeword[pos] ^= BurstAddress.gmult(t, BurstAddress.ginv(denom));
            }
        }

        return true;
    }

    private encode() {
        let p = [0, 0, 0, 0];

        for (let i = 12; i >= 0; i--) {
            let fb = this.codeword[i] ^ p[3];

            p[3] = p[2] ^ BurstAddress.gmult(30, fb);
            p[2] = p[1] ^ BurstAddress.gmult(6, fb);
            p[1] = p[0] ^ BurstAddress.gmult(9, fb);
            p[0] = BurstAddress.gmult(17, fb);
        }

        this.codeword[13] = p[0];
        this.codeword[14] = p[1];
        this.codeword[15] = p[2];
        this.codeword[16] = p[3];
    }

    private reset() {
        for (let i = 0; i < 17; i++) {
            this.codeword[i] = 1;
        }
    }

    private setCodeword(cw, len = undefined, skip = undefined) {
        if (typeof len === 'undefined') len = 17;
        if (typeof skip === 'undefined') skip = -1;

        for (let i = 0, j = 0; i < len; i++) {
            if (i != skip) this.codeword[BurstAddress.cwmap[j++]] = cw[i];
        }
    }

    public addGuess() {
        let s = this.toString(),
            len = this.guess.length;

        if (len > 2) return;

        for (let i = 0; i < len; i++) {
            if (this.guess[i] == s) return;
        }

        this.guess[len] = s;
    }

    public ok() {
        let sum = 0;

        for (let i = 1; i < 5; i++) {
            let t = 0;
            for (let j = 0; j < 31; j++) {
                if (j > 12 && j < 27) continue;

                let pos = j;
                if (j > 26) pos -= 14;

                t ^= BurstAddress.gmult(this.codeword[pos], BurstAddress.gexp[(i * j) % 31]);
            }

            sum |= t;
            this.syndrome[i] = t;
        }

        return (sum == 0);
    }

    private fromAccount(acc) {
        let inp = [],
            out = [],
            pos = 0,
            len = acc.length;

        if (len == 20 && acc.charAt(0) != '1') return false;

        for (let i = 0; i < len; i++) {
            inp[i] = acc.charCodeAt(i) - '0'.charCodeAt(0);
        }

        let divide = 0,
            newlen = 0;

        do // base 10 to base 32 conversion
        {
            for (let i = 0; i < len; i++) {
                divide = divide * 10 + inp[i];

                if (divide >= 32) {
                    inp[newlen++] = divide >> 5;
                    divide &= 31;
                } else if (newlen > 0) {
                    inp[newlen++] = 0;
                }
            }

            len = newlen;
            out[pos++] = divide;
        }
        while (newlen);

        for (let i = 0; i < 13; i++) // copy to codeword in reverse, pad with 0's
        {
            this.codeword[i] = (--pos >= 0 ? out[i] : 0);
        }

        this.encode();

        return true;
    }

    public toString() {
        let out = 'BURST-';

        for (let i = 0; i < 17; i++) {
            out += BurstAddress.alphabet[this.codeword[BurstAddress.cwmap[i]]];

            if ((i & 3) == 3 && i < 13) out += '-';
        }

        return out;
    }

    public AccountId() {
        let out = '',
            inp = [],
            len = 13;

        for (let i = 0; i < 13; i++) {
            inp[i] = this.codeword[12 - i];
        }

        let divide = 0,
            newlen = 0;

        do // base 32 to base 10 conversion
        {
            for (let i = 0; i < len; i++) {
                divide = divide * 32 + inp[i];

                if (divide >= 10) {
                    inp[newlen++] = Math.floor(divide / 10);
                    divide %= 10;
                } else if (newlen > 0) {
                    inp[newlen++] = 0;
                }
            }

            len = newlen;
            out += String.fromCharCode(divide + '0'.charCodeAt(0));
        }
        while (newlen);

        return out.split("").reverse().join("");
    }

    public set(adr, allow_accounts) {
        if (typeof allow_accounts === 'undefined') allow_accounts = true;

        let len = 0;
        let clean = [];
        this.guess = [];
        this.reset();

        adr = String(adr);

        adr = adr.replace(/(^\s+)|(\s+$)/g, '').toUpperCase();

        if (adr.indexOf('BURST-') == 0) adr = adr.substr(6);

        if (adr.match(/^\d{1,20}$/g)) // account id
        {
            if (allow_accounts) return this.fromAccount(adr);
        }
        else // address
        {
            for (let i = 0; i < adr.length; i++) {
                let pos = BurstAddress.alphabet.indexOf(adr[i]);

                if (pos >= 0) {
                    clean[len++] = pos;
                    if (len > 18) return false;
                }
            }
        }

        if (len == 16) // guess deletion
        {
            for (let i = 16; i >= 0; i--) {
                for (let j = 0; j < 32; j++) {
                    clean[i] = j;

                    this.setCodeword(clean);

                    if (this.ok()) this.addGuess();
                }

                if (i > 0) {
                    let t = clean[i - 1];
                    clean[i - 1] = clean[i];
                    clean[i] = t;
                }
            }
        }

        if (len == 18) // guess insertion
        {
            for (let i = 0; i < 18; i++) {
                this.setCodeword(clean, 18, i);

                if (this.ok()) this.addGuess();
            }
        }

        if (len == 17) {
            this.setCodeword(clean);

            if (this.ok()) return true;

            if (this.guessErrors() && this.ok()) this.addGuess();
        }

        this.reset();

        return false;
    }

    public formatGuess(s, org) {
        let d = '',
            list = [];

        s = s.toUpperCase();
        org = org.toUpperCase();

        for (let i = 0; i < s.length;) {
            let m = 0;

            for (let j = 1; j < s.length; j++) {
                let pos = org.indexOf(s.substr(i, j));

                if (pos != -1) {
                    if (Math.abs(pos - i) < 3) m = j;
                } else break;
            }

            if (m) {
                list[list.length] = {
                    's': i,
                    'e': i + m
                };
                i += m;
            } else i++;
        }

        if (list.length == 0) return s;

        for (let i = 0, j = 0; i < s.length; i++) {
            if (i >= list[j].e) {
                let start;

                while (j < list.length - 1) {
                    start = list[j++].s;

                    if (i < list[j].e || list[j].s >= start) break;
                }
            }

            if (i >= list[j].s && i < list[j].e) {
                d += s.charAt(i);
            } else {
                d += '<b style="color:red">' + s.charAt(i) + '</b>';
            }
        }

        return d;
    }
}
