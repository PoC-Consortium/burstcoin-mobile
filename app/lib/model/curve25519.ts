/* Ported to JavaScript from Java 07/01/14.
 *
 * Ported from C to Java by Dmitry Skiba [sahn0], 23/02/08.
 * Original: http://cds.xs4all.nl:8081/ecdh/
 */
/* Generic 64-bit integer implementation of Curve25519 ECDH
 * Written by Matthijs van Duin, 200608242056
 * Public domain.
 *
 * Based on work by Daniel J Bernstein, http://cr.yp.to/ecdh.html
 */

export class Curve25519 {

    //region Constants

    private static KEY_SIZE: number = 32;

    /* array length */
    private static UNPACKED_SIZE: number = 16;

    /* group order (a prime near 2^252+2^124) */
    private static ORDER: number[] = [
        237, 211, 245, 92,
        26, 99, 18, 88,
        214, 156, 247, 162,
        222, 249, 222, 20,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 16
    ];

    /* smallest multiple of the order that's >= 2^255 */
    private static ORDER_TIMES_8: number[] = [
        104, 159, 174, 231,
        210, 24, 147, 192,
        178, 230, 188, 23,
        245, 206, 247, 166,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 128
    ];

    /* constants 2Gy and 1/(2Gy) */
    private static BASE_2Y: number[] = [
        22587, 610, 29883, 44076,
        15515, 9479, 25859, 56197,
        23910, 4462, 17831, 16322,
        62102, 36542, 52412, 16035
    ];

    private static BASE_R2Y: number[] = [
        5744, 16384, 61977, 54121,
        8776, 18501, 26522, 34893,
        23833, 5823, 55924, 58749,
        24147, 14085, 13606, 6080
    ];

    private static C1: number[] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private static C9: number[] = [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private static C486671 = [0x6D0F, 0x0007, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private static C39420360 = [0x81C8, 0x0259, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    private static P25: number = 33554431; /* (1 << 25) - 1 */
    private static P26: number = 67108863; /* (1 << 26) - 1 */

    //#endregion

    //region Key Agreement

    /* Private key clamping
     *   k [out] your private key for key agreement
     *   k  [in]  32 random bytes
     */
    private static clamp(k) {
        k[31] &= 0x7F;
        k[31] |= 0x40;
        k[ 0] &= 0xF8;
    }

    //endregion

    //region radix 2^8 math

    private static cpy32(d, s) {
        for (let i = 0; i < 32; i++)
            d[i] = s[i];
    }

    /* p[m..n+m-1] = q[m..n+m-1] + z * x */
    /* n is the size of x */
    /* n+m is the size of p and q */
    private static mula_small(p, q, m, x, n, z) {
        m = m | 0;
        n = n | 0;
        z = z | 0;

        let v = 0;
        for (let i = 0; i < n; ++i) {
            v += (q[i + m] & 0xFF) + z * (x[i] & 0xFF);
            p[i + m] = (v & 0xFF);
            v >>= 8;
        }

        return v;
    }

    /* p += x * y * z  where z is a small integer
     * x is size 32, y is size t, p is size 32+t
     * y is allowed to overlap with p+32 if you don't care about the upper half  */
    private static mula32(p, x, y, t, z) {
        t = t | 0;
        z = z | 0;

        let n = 31;
        let w = 0;
        let i = 0;
        for (; i < t; i++) {
            let zy = z * (y[i] & 0xFF);
            w += Curve25519.mula_small(p, p, i, x, n, zy) + (p[i+n] & 0xFF) + zy * (x[n] & 0xFF);
            p[i + n] = w & 0xFF;
            w >>= 8;
        }
        p[i + n] = (w + (p[i + n] & 0xFF)) & 0xFF;
        return w >> 8;
    }

    /* divide r (size n) by d (size t), returning quotient q and remainder r
     * quotient is size n-t+1, remainder is size t
     * requires t > 0 && d[t-1] !== 0
     * requires that r[-1] and d[-1] are valid memory locations
     * q may overlap with r+t */
    private static divmod(q, r, n, d, t) {
        n = n | 0;
        t = t | 0;

        let rn = 0;
        let dt = (d[t - 1] & 0xFF) << 8;
        if (t > 1)
            dt |= (d[t - 2] & 0xFF);

        while (n-- >= t) {
            let z = (rn << 16) | ((r[n] & 0xFF) << 8);
            if (n > 0)
                z |= (r[n - 1] & 0xFF);

            let i = n - t + 1;
            z /= dt;
            rn += Curve25519.mula_small(r, r, i, d, t, -z);
            q[i] = (z + rn) & 0xFF;
            /* rn is 0 or -1 (underflow) */
            Curve25519.mula_small(r, r, i, d, t, -rn);
            rn = r[n] & 0xFF;
            r[n] = 0;
        }

        r[t-1] = rn & 0xFF;
    }

    private static numsize(x, n) {
        while (n-- !== 0 && x[n] === 0) { }
        return n + 1;
    }

    /* Returns x if a contains the gcd, y if b.
     * Also, the returned buffer contains the inverse of a mod b,
     * as 32-byte signed.
     * x and y must have 64 bytes space for temporary use.
     * requires that a[-1] and b[-1] are valid memory locations  */
    private static egcd32(x, y, a, b) {
        let an, bn = 32, qn, i;
        for (i = 0; i < 32; i++)
            x[i] = y[i] = 0;
        x[0] = 1;
        an = Curve25519.numsize(a, 32);
        if (an === 0)
            return y; /* division by zero */
        let temp = new Array(32);
        while (true) {
            qn = bn - an + 1;
            Curve25519.divmod(temp, b, bn, a, an);
            bn = Curve25519.numsize(b, bn);
            if (bn === 0)
                return x;
            Curve25519.mula32(y, x, temp, qn, -1);

            qn = an - bn + 1;
            Curve25519.divmod(temp, a, an, b, bn);
            an = Curve25519.numsize(a, an);
            if (an === 0)
                return y;
            Curve25519.mula32(x, y, temp, qn, -1);
        }
    }

    //endregion

    //region radix 2^25.5 GF(2^255-19) math

    //region pack / unpack

    /* Convert to internal format from little-endian byte format */
    private static unpack(x, m) {
        for (let i = 0; i < Curve25519.KEY_SIZE; i += 2)
            x[i / 2] = m[i] & 0xFF | ((m[i + 1] & 0xFF) << 8);
    }

    /* Check if reduced-form input >= 2^255-19 */
    private static is_overflow(x) {
        return (
            ((x[0] > Curve25519.P26 - 19)) &&
                ((x[1] & x[3] & x[5] & x[7] & x[9]) === Curve25519.P25) &&
                ((x[2] & x[4] & x[6] & x[8]) === Curve25519.P26)
            ) || (x[9] > Curve25519.P25);
    }

    /* Convert from internal format to little-endian byte format.  The
     * number must be in a reduced form which is output by the following ops:
     *     unpack, mul, sqr
     *     set --  if input in range 0 .. P25
     * If you're unsure if the number is reduced, first multiply it by 1.  */
    private static pack(x, m) {
        for (let i = 0; i < Curve25519.UNPACKED_SIZE; ++i) {
            m[2 * i] = x[i] & 0x00FF;
            m[2 * i + 1] = (x[i] & 0xFF00) >> 8;
        }
    }

    //endregion

    private static createUnpackedArray() {
        return new Uint16Array(Curve25519.UNPACKED_SIZE);
    }

    /* Copy a number */
    private static cpy(d, s) {
        for (let i = 0; i < Curve25519.UNPACKED_SIZE; ++i)
            d[i] = s[i];
    }

    /* Set a number to value, which must be in range -185861411 .. 185861411 */
    private static set(d, s) {
        d[0] = s;
        for (let i = 1; i < Curve25519.UNPACKED_SIZE; ++i)
            d[i] = 0;
    }

    /* Calculates a reciprocal.  The output is in reduced form, the inputs need not
     * be.  Simply calculates  y = x^(p-2)  so it's not too fast. */
    /* When sqrtassist is true, it instead calculates y = x^((p-5)/8) */
    private static recip(y, x, sqrtassist) {
        let t0 = Curve25519.createUnpackedArray();
        let t1 = Curve25519.createUnpackedArray();
        let t2 = Curve25519.createUnpackedArray();
        let t3 = Curve25519.createUnpackedArray();
        let t4 = Curve25519.createUnpackedArray();

        /* the chain for x^(2^255-21) is straight from djb's implementation */
        let i;
        Curve25519.sqr(t1, x); /*  2 === 2 * 1	*/
        Curve25519.sqr(t2, t1); /*  4 === 2 * 2	*/
        Curve25519.sqr(t0, t2); /*  8 === 2 * 4	*/
        Curve25519.mul(t2, t0, x); /*  9 === 8 + 1	*/
        Curve25519.mul(t0, t2, t1); /* 11 === 9 + 2	*/
        Curve25519.sqr(t1, t0); /* 22 === 2 * 11	*/
        Curve25519.mul(t3, t1, t2); /* 31 === 22 + 9 === 2^5   - 2^0	*/
        Curve25519.sqr(t1, t3); /* 2^6   - 2^1	*/
        Curve25519.sqr(t2, t1); /* 2^7   - 2^2	*/
        Curve25519.sqr(t1, t2); /* 2^8   - 2^3	*/
        Curve25519.sqr(t2, t1); /* 2^9   - 2^4	*/
        Curve25519.sqr(t1, t2); /* 2^10  - 2^5	*/
        Curve25519.mul(t2, t1, t3); /* 2^10  - 2^0	*/
        Curve25519.sqr(t1, t2); /* 2^11  - 2^1	*/
        Curve25519.sqr(t3, t1); /* 2^12  - 2^2	*/
        for (i = 1; i < 5; i++) {
            Curve25519.sqr(t1, t3);
            Curve25519.sqr(t3, t1);
        } /* t3 */ /* 2^20  - 2^10	*/
        Curve25519.mul(t1, t3, t2); /* 2^20  - 2^0	*/
        Curve25519.sqr(t3, t1); /* 2^21  - 2^1	*/
        Curve25519.sqr(t4, t3); /* 2^22  - 2^2	*/
        for (i = 1; i < 10; i++) {
            Curve25519.sqr(t3, t4);
            Curve25519.sqr(t4, t3);
        } /* t4 */ /* 2^40  - 2^20	*/
        Curve25519.mul(t3, t4, t1); /* 2^40  - 2^0	*/
        for (i = 0; i < 5; i++) {
            Curve25519.sqr(t1, t3);
            Curve25519.sqr(t3, t1);
        } /* t3 */ /* 2^50  - 2^10	*/
        Curve25519.mul(t1, t3, t2); /* 2^50  - 2^0	*/
        Curve25519.sqr(t2, t1); /* 2^51  - 2^1	*/
        Curve25519.sqr(t3, t2); /* 2^52  - 2^2	*/
        for (i = 1; i < 25; i++) {
            Curve25519.sqr(t2, t3);
            Curve25519.sqr(t3, t2);
        } /* t3 */ /* 2^100 - 2^50 */
        Curve25519.mul(t2, t3, t1); /* 2^100 - 2^0	*/
        Curve25519.sqr(t3, t2); /* 2^101 - 2^1	*/
        Curve25519.sqr(t4, t3); /* 2^102 - 2^2	*/
        for (i = 1; i < 50; i++) {
            Curve25519.sqr(t3, t4);
            Curve25519.sqr(t4, t3);
        } /* t4 */ /* 2^200 - 2^100 */
        Curve25519.mul(t3, t4, t2); /* 2^200 - 2^0	*/
        for (i = 0; i < 25; i++) {
            Curve25519.sqr(t4, t3);
            Curve25519.sqr(t3, t4);
        } /* t3 */ /* 2^250 - 2^50	*/
        Curve25519.mul(t2, t3, t1); /* 2^250 - 2^0	*/
        Curve25519.sqr(t1, t2); /* 2^251 - 2^1	*/
        Curve25519.sqr(t2, t1); /* 2^252 - 2^2	*/
        if (sqrtassist !== 0) {
            Curve25519.mul(y, x, t2); /* 2^252 - 3 */
        } else {
            Curve25519.sqr(t1, t2); /* 2^253 - 2^3	*/
            Curve25519.sqr(t2, t1); /* 2^254 - 2^4	*/
            Curve25519.sqr(t1, t2); /* 2^255 - 2^5	*/
            Curve25519.mul(y, t1, t0); /* 2^255 - 21	*/
        }
    }

    /* checks if x is "negative", requires reduced input */
    private static is_negative(x) {
        let isOverflowOrNegative = Curve25519.is_overflow(x) || x[9] < 0;
        let leastSignificantBit = x[0] & 1;
        return ((isOverflowOrNegative ? 1 : 0) ^ leastSignificantBit) & 0xFFFFFFFF;
    }

    /* a square root */
    private static sqrt(x, u) {
        let v = Curve25519.createUnpackedArray();
        let t1 = Curve25519.createUnpackedArray();
        let t2 = Curve25519.createUnpackedArray();

        Curve25519.add(t1, u, u); /* t1 = 2u		*/
        Curve25519.recip(v, t1, 1); /* v = (2u)^((p-5)/8)	*/
        Curve25519.sqr(x, v); /* x = v^2		*/
        Curve25519.mul(t2, t1, x); /* t2 = 2uv^2		*/
        Curve25519.sub(t2, t2, Curve25519.C1); /* t2 = 2uv^2-1		*/
        Curve25519.mul(t1, v, t2); /* t1 = v(2uv^2-1)	*/
        Curve25519.mul(x, u, t1); /* x = uv(2uv^2-1)	*/
    }

    //endregion

    //region JavaScript Fast Math

    private static c255lsqr8h(a7, a6, a5, a4, a3, a2, a1, a0) {
        let r = [];
        let v;
        r[0] = (v = a0*a0) & 0xFFFF;
        r[1] = (v = ((v / 0x10000) | 0) + 2*a0*a1) & 0xFFFF;
        r[2] = (v = ((v / 0x10000) | 0) + 2*a0*a2 + a1*a1) & 0xFFFF;
        r[3] = (v = ((v / 0x10000) | 0) + 2*a0*a3 + 2*a1*a2) & 0xFFFF;
        r[4] = (v = ((v / 0x10000) | 0) + 2*a0*a4 + 2*a1*a3 + a2*a2) & 0xFFFF;
        r[5] = (v = ((v / 0x10000) | 0) + 2*a0*a5 + 2*a1*a4 + 2*a2*a3) & 0xFFFF;
        r[6] = (v = ((v / 0x10000) | 0) + 2*a0*a6 + 2*a1*a5 + 2*a2*a4 + a3*a3) & 0xFFFF;
        r[7] = (v = ((v / 0x10000) | 0) + 2*a0*a7 + 2*a1*a6 + 2*a2*a5 + 2*a3*a4) & 0xFFFF;
        r[8] = (v = ((v / 0x10000) | 0) + 2*a1*a7 + 2*a2*a6 + 2*a3*a5 + a4*a4) & 0xFFFF;
        r[9] = (v = ((v / 0x10000) | 0) + 2*a2*a7 + 2*a3*a6 + 2*a4*a5) & 0xFFFF;
        r[10] = (v = ((v / 0x10000) | 0) + 2*a3*a7 + 2*a4*a6 + a5*a5) & 0xFFFF;
        r[11] = (v = ((v / 0x10000) | 0) + 2*a4*a7 + 2*a5*a6) & 0xFFFF;
        r[12] = (v = ((v / 0x10000) | 0) + 2*a5*a7 + a6*a6) & 0xFFFF;
        r[13] = (v = ((v / 0x10000) | 0) + 2*a6*a7) & 0xFFFF;
        r[14] = (v = ((v / 0x10000) | 0) + a7*a7) & 0xFFFF;
        r[15] = ((v / 0x10000) | 0);
        return r;
    }

    /* Square a number.  Optimization of  mul25519(x2, x, x)  c255lsqrmodp*/
    private static sqr(r, a) {
        let x = Curve25519.c255lsqr8h(a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8]);
        let z = Curve25519.c255lsqr8h(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0]);
        let y = Curve25519.c255lsqr8h(a[15] + a[7], a[14] + a[6], a[13] + a[5], a[12] + a[4], a[11] + a[3], a[10] + a[2], a[9] + a[1], a[8] + a[0]);

        let v;
        r[0] = (v = 0x800000 + z[0] + (y[8] -x[8] -z[8] + x[0] -0x80) * 38) & 0xFFFF;
        r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] -x[9] -z[9] + x[1]) * 38) & 0xFFFF;
        r[2] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] -x[10] -z[10] + x[2]) * 38) & 0xFFFF;
        r[3] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] -x[11] -z[11] + x[3]) * 38) & 0xFFFF;
        r[4] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] -x[12] -z[12] + x[4]) * 38) & 0xFFFF;
        r[5] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] -x[13] -z[13] + x[5]) * 38) & 0xFFFF;
        r[6] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] -x[14] -z[14] + x[6]) * 38) & 0xFFFF;
        r[7] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] -x[15] -z[15] + x[7]) * 38) & 0xFFFF;
        r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] -x[0] -z[0] + x[8] * 38) & 0xFFFF;
        r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] -x[1] -z[1] + x[9] * 38) & 0xFFFF;
        r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] -x[2] -z[2] + x[10] * 38) & 0xFFFF;
        r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] -x[3] -z[3] + x[11] * 38) & 0xFFFF;
        r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] -x[4] -z[4] + x[12] * 38) & 0xFFFF;
        r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] -x[5] -z[5] + x[13] * 38) & 0xFFFF;
        r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] -x[6] -z[6] + x[14] * 38) & 0xFFFF;
        let r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] -x[7] -z[7] + x[15] * 38;
        Curve25519.c255lreduce(r, r15);
    }

    private static c255lmul8h(a7, a6, a5, a4, a3, a2, a1, a0, b7, b6, b5, b4, b3, b2, b1, b0) {
        let r = [];
        let v;
        r[0] = (v = a0*b0) & 0xFFFF;
        r[1] = (v = ((v / 0x10000) | 0) + a0*b1 + a1*b0) & 0xFFFF;
        r[2] = (v = ((v / 0x10000) | 0) + a0*b2 + a1*b1 + a2*b0) & 0xFFFF;
        r[3] = (v = ((v / 0x10000) | 0) + a0*b3 + a1*b2 + a2*b1 + a3*b0) & 0xFFFF;
        r[4] = (v = ((v / 0x10000) | 0) + a0*b4 + a1*b3 + a2*b2 + a3*b1 + a4*b0) & 0xFFFF;
        r[5] = (v = ((v / 0x10000) | 0) + a0*b5 + a1*b4 + a2*b3 + a3*b2 + a4*b1 + a5*b0) & 0xFFFF;
        r[6] = (v = ((v / 0x10000) | 0) + a0*b6 + a1*b5 + a2*b4 + a3*b3 + a4*b2 + a5*b1 + a6*b0) & 0xFFFF;
        r[7] = (v = ((v / 0x10000) | 0) + a0*b7 + a1*b6 + a2*b5 + a3*b4 + a4*b3 + a5*b2 + a6*b1 + a7*b0) & 0xFFFF;
        r[8] = (v = ((v / 0x10000) | 0) + a1*b7 + a2*b6 + a3*b5 + a4*b4 + a5*b3 + a6*b2 + a7*b1) & 0xFFFF;
        r[9] = (v = ((v / 0x10000) | 0) + a2*b7 + a3*b6 + a4*b5 + a5*b4 + a6*b3 + a7*b2) & 0xFFFF;
        r[10] = (v = ((v / 0x10000) | 0) + a3*b7 + a4*b6 + a5*b5 + a6*b4 + a7*b3) & 0xFFFF;
        r[11] = (v = ((v / 0x10000) | 0) + a4*b7 + a5*b6 + a6*b5 + a7*b4) & 0xFFFF;
        r[12] = (v = ((v / 0x10000) | 0) + a5*b7 + a6*b6 + a7*b5) & 0xFFFF;
        r[13] = (v = ((v / 0x10000) | 0) + a6*b7 + a7*b6) & 0xFFFF;
        r[14] = (v = ((v / 0x10000) | 0) + a7*b7) & 0xFFFF;
        r[15] = ((v / 0x10000) | 0);
        return r;
    }

    /* Multiply two numbers.  The output is in reduced form, the inputs need not be. c255lmulmodp*/
    private static mul(r, a, b) {
        // Karatsuba multiplication scheme: x*y = (b^2+b)*x1*y1 - b*(x1-x0)*(y1-y0) + (b+1)*x0*y0
        let x = Curve25519.c255lmul8h(a[15], a[14], a[13], a[12], a[11], a[10], a[9], a[8], b[15], b[14], b[13], b[12], b[11], b[10], b[9], b[8]);
        let z = Curve25519.c255lmul8h(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0], b[7], b[6], b[5], b[4], b[3], b[2], b[1], b[0]);
        let y = Curve25519.c255lmul8h(a[15] + a[7], a[14] + a[6], a[13] + a[5], a[12] + a[4], a[11] + a[3], a[10] + a[2], a[9] + a[1], a[8] + a[0],
            b[15] + b[7], b[14] + b[6], b[13] + b[5], b[12] + b[4], b[11] + b[3], b[10] + b[2], b[9] + b[1], b[8] + b[0]);

        let v;
        r[0] = (v = 0x800000 + z[0] + (y[8] -x[8] -z[8] + x[0] -0x80) * 38) & 0xFFFF;
        r[1] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[1] + (y[9] -x[9] -z[9] + x[1]) * 38) & 0xFFFF;
        r[2] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[2] + (y[10] -x[10] -z[10] + x[2]) * 38) & 0xFFFF;
        r[3] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[3] + (y[11] -x[11] -z[11] + x[3]) * 38) & 0xFFFF;
        r[4] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[4] + (y[12] -x[12] -z[12] + x[4]) * 38) & 0xFFFF;
        r[5] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[5] + (y[13] -x[13] -z[13] + x[5]) * 38) & 0xFFFF;
        r[6] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[6] + (y[14] -x[14] -z[14] + x[6]) * 38) & 0xFFFF;
        r[7] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[7] + (y[15] -x[15] -z[15] + x[7]) * 38) & 0xFFFF;
        r[8] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[8] + y[0] -x[0] -z[0] + x[8] * 38) & 0xFFFF;
        r[9] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[9] + y[1] -x[1] -z[1] + x[9] * 38) & 0xFFFF;
        r[10] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[10] + y[2] -x[2] -z[2] + x[10] * 38) & 0xFFFF;
        r[11] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[11] + y[3] -x[3] -z[3] + x[11] * 38) & 0xFFFF;
        r[12] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[12] + y[4] -x[4] -z[4] + x[12] * 38) & 0xFFFF;
        r[13] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[13] + y[5] -x[5] -z[5] + x[13] * 38) & 0xFFFF;
        r[14] = (v = 0x7fff80 + ((v / 0x10000) | 0) + z[14] + y[6] -x[6] -z[6] + x[14] * 38) & 0xFFFF;
        let r15 = 0x7fff80 + ((v / 0x10000) | 0) + z[15] + y[7] -x[7] -z[7] + x[15] * 38;
        Curve25519.c255lreduce(r, r15);
    }

    private static c255lreduce(a, a15) {
        let v = a15;
        a[15] = v & 0x7FFF;
        v = ((v / 0x8000) | 0) * 19;
        for (let i = 0; i <= 14; ++i) {
            a[i] = (v += a[i]) & 0xFFFF;
            v = ((v / 0x10000) | 0);
        }

        a[15] += v;
    }

    /* Add/subtract two numbers.  The inputs must be in reduced form, and the
     * output isn't, so to do another addition or subtraction on the output,
     * first multiply it by one to reduce it. c255laddmodp*/
    private static add(r, a, b) {
        let v;
        r[0] = (v = (((a[15] / 0x8000) | 0) + ((b[15] / 0x8000) | 0)) * 19 + a[0] + b[0]) & 0xFFFF;
        for (let i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + a[i] + b[i]) & 0xFFFF;

        r[15] = ((v / 0x10000) | 0) + (a[15] & 0x7FFF) + (b[15] & 0x7FFF);
    }

    /* Add/subtract two numbers.  The inputs must be in reduced form, and the
     * output isn't, so to do another addition or subtraction on the output,
     * first multiply it by one to reduce it. c255lsubmodp*/
    private static sub(r, a, b) {
        let v;
        r[0] = (v = 0x80000 + (((a[15] / 0x8000) | 0) - ((b[15] / 0x8000) | 0) - 1) * 19 + a[0] - b[0]) & 0xFFFF;
        for (let i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + 0x7fff8 + a[i] - b[i]) & 0xFFFF;

        r[15] = ((v / 0x10000) | 0) + 0x7ff8 + (a[15] & 0x7FFF) - (b[15] & 0x7FFF);
    }

    /* Multiply a number by a small integer in range -185861411 .. 185861411.
     * The output is in reduced form, the input x need not be.  x and xy may point
     * to the same buffer. c255lmulasmall*/
    private static mul_small(r, a, m) {
        let v;
        r[0] = (v = a[0] * m) & 0xFFFF;
        for (let i = 1; i <= 14; ++i)
            r[i] = (v = ((v / 0x10000) | 0) + a[i]*m) & 0xFFFF;

        let r15 = ((v / 0x10000) | 0) + a[15]*m;
        Curve25519.c255lreduce(r, r15);
    }

    //endregion

    /********************* Elliptic curve *********************/

    /* y^2 = x^3 + 486662 x^2 + x  over GF(2^255-19) */

    /* t1 = ax + az
     * t2 = ax - az  */
    private static mont_prep(t1, t2, ax, az) {
        Curve25519.add(t1, ax, az);
        Curve25519.sub(t2, ax, az);
    }

    /* A = P + Q   where
     *  X(A) = ax/az
     *  X(P) = (t1+t2)/(t1-t2)
     *  X(Q) = (t3+t4)/(t3-t4)
     *  X(P-Q) = dx
     * clobbers t1 and t2, preserves t3 and t4  */
    private static mont_add(t1, t2, t3, t4, ax, az, dx) {
        Curve25519.mul(ax, t2, t3);
        Curve25519.mul(az, t1, t4);
        Curve25519.add(t1, ax, az);
        Curve25519.sub(t2, ax, az);
        Curve25519.sqr(ax, t1);
        Curve25519.sqr(t1, t2);
        Curve25519.mul(az, t1, dx);
    }

    /* B = 2 * Q   where
     *  X(B) = bx/bz
     *  X(Q) = (t3+t4)/(t3-t4)
     * clobbers t1 and t2, preserves t3 and t4  */
    private static mont_dbl(t1, t2, t3, t4, bx, bz) {
        Curve25519.sqr(t1, t3);
        Curve25519.sqr(t2, t4);
        Curve25519.mul(bx, t1, t2);
        Curve25519.sub(t2, t1, t2);
        Curve25519.mul_small(bz, t2, 121665);
        Curve25519.add(t1, t1, bz);
        Curve25519.mul(bz, t1, t2);
    }

    /* Y^2 = X^3 + 486662 X^2 + X
     * t is a temporary  */
    private static x_to_y2(t, y2, x) {
        Curve25519.sqr(t, x);
        Curve25519.mul_small(y2, x, 486662);
        Curve25519.add(t, t, y2);
        Curve25519.add(t, t, Curve25519.C1);
        Curve25519.mul(y2, t, x);
    }

    /* P = kG   and  s = sign(P)/k  */
    private static core(Px, s, k, Gx) {
        let dx = Curve25519.createUnpackedArray();
        let t1 = Curve25519.createUnpackedArray();
        let t2 = Curve25519.createUnpackedArray();
        let t3 = Curve25519.createUnpackedArray();
        let t4 = Curve25519.createUnpackedArray();
        let x = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let z = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let i, j;

        /* unpack the base */
        if (Gx !== null)
            Curve25519.unpack(dx, Gx);
        else
            Curve25519.set(dx, 9);

        /* 0G = point-at-infinity */
        Curve25519.set(x[0], 1);
        Curve25519.set(z[0], 0);

        /* 1G = G */
        Curve25519.cpy(x[1], dx);
        Curve25519.set(z[1], 1);

        for (i = 32; i-- !== 0;) {
            for (j = 8; j-- !== 0;) {
                /* swap arguments depending on bit */
                let bit1 = (k[i] & 0xFF) >> j & 1;
                let bit0 = ~(k[i] & 0xFF) >> j & 1;
                let ax = x[bit0];
                let az = z[bit0];
                let bx = x[bit1];
                let bz = z[bit1];

                /* a' = a + b	*/
                /* b' = 2 b	*/
                Curve25519.mont_prep(t1, t2, ax, az);
                Curve25519.mont_prep(t3, t4, bx, bz);
                Curve25519.mont_add(t1, t2, t3, t4, ax, az, dx);
                Curve25519.mont_dbl(t1, t2, t3, t4, bx, bz);
            }
        }

        Curve25519.recip(t1, z[0], 0);
        Curve25519.mul(dx, x[0], t1);

        Curve25519.pack(dx, Px);

        /* calculate s such that s abs(P) = G  .. assumes G is std base point */
        if (s !== null) {
            Curve25519.x_to_y2(t2, t1, dx); /* t1 = Py^2  */
            Curve25519.recip(t3, z[1], 0); /* where Q=P+G ... */
            Curve25519.mul(t2, x[1], t3); /* t2 = Qx  */
            Curve25519.add(t2, t2, dx); /* t2 = Qx + Px  */
            Curve25519.add(t2, t2, Curve25519.C486671); /* t2 = Qx + Px + Gx + 486662  */
            Curve25519.sub(dx, dx, Curve25519.C9); /* dx = Px - Gx  */
            Curve25519.sqr(t3, dx); /* t3 = (Px - Gx)^2  */
            Curve25519.mul(dx, t2, t3); /* dx = t2 (Px - Gx)^2  */
            Curve25519.sub(dx, dx, t1); /* dx = t2 (Px - Gx)^2 - Py^2  */
            Curve25519.sub(dx, dx, Curve25519.C39420360); /* dx = t2 (Px - Gx)^2 - Py^2 - Gy^2  */
            Curve25519.mul(t1, dx, Curve25519.BASE_R2Y); /* t1 = -Py  */

            if (Curve25519.is_negative(t1) !== 0)    /* sign is 1, so just copy  */
                Curve25519.cpy32(s, k);
            else            /* sign is -1, so negate  */
                Curve25519.mula_small(s, Curve25519.ORDER_TIMES_8, 0, k, 32, -1);

            /* reduce s mod q
             * (is this needed?  do it just in case, it's fast anyway) */
            //divmod((dstptr) t1, s, 32, order25519, 32);

            /* take reciprocal of s mod q */
            let temp1 = new Array(32);
            let temp2 = new Array(64);
            let temp3 = new Array(64);
            Curve25519.cpy32(temp1, Curve25519.ORDER);
            Curve25519.cpy32(s, Curve25519.egcd32(temp2, temp3, s, temp1));
            if ((s[31] & 0x80) !== 0)
                Curve25519.mula_small(s, s, 0, Curve25519.ORDER, 32, 1);

        }
    }

    /********* DIGITAL SIGNATURES *********/

    /* deterministic EC-KCDSA
     *
     *    s is the private key for signing
     *    P is the corresponding public key
     *    Z is the context data (signer public key or certificate, etc)
     *
     * signing:
     *
     *    m = hash(Z, message)
     *    x = hash(m, s)
     *    keygen25519(Y, NULL, x);
     *    r = hash(Y);
     *    h = m XOR r
     *    sign25519(v, h, x, s);
     *
     *    output (v,r) as the signature
     *
     * verification:
     *
     *    m = hash(Z, message);
     *    h = m XOR r
     *    verify25519(Y, v, h, P)
     *
     *    confirm  r === hash(Y)
     *
     * It would seem to me that it would be simpler to have the signer directly do
     * h = hash(m, Y) and send that to the recipient instead of r, who can verify
     * the signature by checking h === hash(m, Y).  If there are any problems with
     * such a scheme, please let me know.
     *
     * Also, EC-KCDSA (like most DS algorithms) picks x random, which is a waste of
     * perfectly good entropy, but does allow Y to be calculated in advance of (or
     * parallel to) hashing the message.
     */

    /* Signature generation primitive, calculates (x-h)s mod q
     *   h  [in]  signature hash (of message, signature pub key, and context data)
     *   x  [in]  signature private key
     *   s  [in]  private key for signing
     * returns signature value on success, undefined on failure (use different x or h)
     */

    public static sign(h, x, s) {
        // v = (x - h) s  mod q
        let w, i;
        let h1 = new Array(32)
        let x1 = new Array(32);
        let tmp1 = new Array(64);
        let tmp2 = new Array(64);

        // Don't clobber the arguments, be nice!
        Curve25519.cpy32(h1, h);
        Curve25519.cpy32(x1, x);

        // Reduce modulo group order
        let tmp3 = new Array(32);
        Curve25519.divmod(tmp3, h1, 32, Curve25519.ORDER, 32);
        Curve25519.divmod(tmp3, x1, 32, Curve25519.ORDER, 32);

        // v = x1 - h1
        // If v is negative, add the group order to it to become positive.
        // If v was already positive we don't have to worry about overflow
        // when adding the order because v < ORDER and 2*ORDER < 2^256
        let v = new Array(32);
        Curve25519.mula_small(v, x1, 0, h1, 32, -1);
        Curve25519.mula_small(v, v , 0, Curve25519.ORDER, 32, 1);

        // tmp1 = (x-h)*s mod q
        Curve25519.mula32(tmp1, v, s, 32, 1);
        Curve25519.divmod(tmp2, tmp1, 64, Curve25519.ORDER, 32);

        for (w = 0, i = 0; i < 32; i++)
            w |= v[i] = tmp1[i];

        return w !== 0 ? v : undefined;
    }

    /* Signature verification primitive, calculates Y = vP + hG
     *   v  [in]  signature value
     *   h  [in]  signature hash
     *   P  [in]  public key
     *   Returns signature public key
     */
    public static verify(v, h, P) {
        /* Y = v abs(P) + h G  */
        let d = new Array(32);
        let p = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let s = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let yx = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let yz = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let t1 = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];
        let t2 = [Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray(), Curve25519.createUnpackedArray()];

        let vi = 0, hi = 0, di = 0, nvh = 0, i, j, k;

        /* set p[0] to G and p[1] to P  */

        Curve25519.set(p[0], 9);
        Curve25519.unpack(p[1], P);

        /* set s[0] to P+G and s[1] to P-G  */

        /* s[0] = (Py^2 + Gy^2 - 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */
        /* s[1] = (Py^2 + Gy^2 + 2 Py Gy)/(Px - Gx)^2 - Px - Gx - 486662  */

        Curve25519.x_to_y2(t1[0], t2[0], p[1]); /* t2[0] = Py^2  */
        Curve25519.sqrt(t1[0], t2[0]); /* t1[0] = Py or -Py  */
        j = Curve25519.is_negative(t1[0]); /*      ... check which  */
        Curve25519.add(t2[0], t2[0], Curve25519.C39420360); /* t2[0] = Py^2 + Gy^2  */
        Curve25519.mul(t2[1], Curve25519.BASE_2Y, t1[0]); /* t2[1] = 2 Py Gy or -2 Py Gy  */
        Curve25519.sub(t1[j], t2[0], t2[1]); /* t1[0] = Py^2 + Gy^2 - 2 Py Gy  */
        Curve25519.add(t1[1 - j], t2[0], t2[1]); /* t1[1] = Py^2 + Gy^2 + 2 Py Gy  */
        Curve25519.cpy(t2[0], p[1]); /* t2[0] = Px  */
        Curve25519.sub(t2[0], t2[0], Curve25519.C9); /* t2[0] = Px - Gx  */
        Curve25519.sqr(t2[1], t2[0]); /* t2[1] = (Px - Gx)^2  */
        Curve25519.recip(t2[0], t2[1], 0); /* t2[0] = 1/(Px - Gx)^2  */
        Curve25519.mul(s[0], t1[0], t2[0]); /* s[0] = t1[0]/(Px - Gx)^2  */
        Curve25519.sub(s[0], s[0], p[1]); /* s[0] = t1[0]/(Px - Gx)^2 - Px  */
        Curve25519.sub(s[0], s[0], Curve25519.C486671); /* s[0] = X(P+G)  */
        Curve25519.mul(s[1], t1[1], t2[0]); /* s[1] = t1[1]/(Px - Gx)^2  */
        Curve25519.sub(s[1], s[1], p[1]); /* s[1] = t1[1]/(Px - Gx)^2 - Px  */
        Curve25519.sub(s[1], s[1], Curve25519.C486671); /* s[1] = X(P-G)  */
        Curve25519.mul_small(s[0], s[0], 1); /* reduce s[0] */
        Curve25519.mul_small(s[1], s[1], 1); /* reduce s[1] */

        /* prepare the chain  */
        for (i = 0; i < 32; i++) {
            vi = (vi >> 8) ^ (v[i] & 0xFF) ^ ((v[i] & 0xFF) << 1);
            hi = (hi >> 8) ^ (h[i] & 0xFF) ^ ((h[i] & 0xFF) << 1);
            nvh = ~(vi ^ hi);
            di = (nvh & (di & 0x80) >> 7) ^ vi;
            di ^= nvh & (di & 0x01) << 1;
            di ^= nvh & (di & 0x02) << 1;
            di ^= nvh & (di & 0x04) << 1;
            di ^= nvh & (di & 0x08) << 1;
            di ^= nvh & (di & 0x10) << 1;
            di ^= nvh & (di & 0x20) << 1;
            di ^= nvh & (di & 0x40) << 1;
            d[i] = di & 0xFF;
        }

        di = ((nvh & (di & 0x80) << 1) ^ vi) >> 8;

        /* initialize state */
        Curve25519.set(yx[0], 1);
        Curve25519.cpy(yx[1], p[di]);
        Curve25519.cpy(yx[2], s[0]);
        Curve25519.set(yz[0], 0);
        Curve25519.set(yz[1], 1);
        Curve25519.set(yz[2], 1);

        /* y[0] is (even)P + (even)G
         * y[1] is (even)P + (odd)G  if current d-bit is 0
         * y[1] is (odd)P + (even)G  if current d-bit is 1
         * y[2] is (odd)P + (odd)G
         */

        vi = 0;
        hi = 0;

        /* and go for it! */
        for (i = 32; i-- !== 0;) {
            vi = (vi << 8) | (v[i] & 0xFF);
            hi = (hi << 8) | (h[i] & 0xFF);
            di = (di << 8) | (d[i] & 0xFF);

            for (j = 8; j-- !== 0;) {
                Curve25519.mont_prep(t1[0], t2[0], yx[0], yz[0]);
                Curve25519.mont_prep(t1[1], t2[1], yx[1], yz[1]);
                Curve25519.mont_prep(t1[2], t2[2], yx[2], yz[2]);

                k = ((vi ^ vi >> 1) >> j & 1)
                    + ((hi ^ hi >> 1) >> j & 1);
                Curve25519.mont_dbl(yx[2], yz[2], t1[k], t2[k], yx[0], yz[0]);

                k = (di >> j & 2) ^ ((di >> j & 1) << 1);
                Curve25519.mont_add(t1[1], t2[1], t1[k], t2[k], yx[1], yz[1],
                    p[di >> j & 1]);

                Curve25519.mont_add(t1[2], t2[2], t1[0], t2[0], yx[2], yz[2],
                    s[((vi ^ hi) >> j & 2) >> 1]);
            }
        }

        k = (vi & 1) + (hi & 1);
        Curve25519.recip(t1[0], yz[k], 0);
        Curve25519.mul(t1[1], yx[k], t1[0]);

        let Y = [];
        Curve25519.pack(t1[1], Y);
        return Y;
    }

    /* Key-pair generation
     *   P  [out] your public key
     *   s  [out] your private key for signing
     *   k  [out] your private key for key agreement
     *   k  [in]  32 random bytes
     * s may be NULL if you don't care
     *
     * WARNING: if s is not NULL, this function has data-dependent timing */
    public keygen (k) {
        let P = [];
        let s = [];
        k = k || [];
        Curve25519.clamp(k);
        Curve25519.core(P, s, k, null);

        return { p: P, s: s, k: k };
    }

}
