import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Currency, HttpError } from "../model";

@Injectable()
export class MarketService {

    constructor(private http: Http) {

    }

    /*
    * Get Currency Data from coinmarketcap
    * TODO Provide interface, for easy swap of currency data provider
    */
    public getCurrency(currency: string = undefined): Promise<Currency> {
            let params: URLSearchParams = new URLSearchParams();
            let requestOptions = this.getRequestOptions();
            if (currency != undefined) {
                currency = currency.toLowerCase();
                params.set("convert", currency);
                requestOptions.params = params;
            }
            return this.http.get("https://api.coinmarketcap.com/v1/ticker/burst", requestOptions)
                .toPromise()
                .then(response => {
                    let c = response.json() || [];
                    if (c.length > 0) {
                        // set currency for currency object
                        c[0]["currency"] = currency;
                        return new Currency(c[0]);
                    }
                })
                .catch(error => {
                    return undefined;
                });
    }

    public getPriceBurstcoin(coins: number) {
        if (coins % 1 === 0) {
            // whole number
            return coins.toString();
        } else {
            return coins.toFixed(8);
        }
    }

    public getPriceBTC(coins: number, currency: Currency) : string {
        return (coins * currency.priceBTC).toFixed(8) + " BTC";
    }

    public getPriceFiatCurrency(coins: number, currency: Currency) : string {
        if (currency.currency != undefined) {
            return (coins * currency.priceCur).toFixed(2) + " " + currency.currency.toUpperCase();
        } else {
            return (coins * currency.priceUSD).toFixed(2) + " $" ;
        }
    }

    /*
    * Helper Method to generate Request options
    */
    public getRequestOptions() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    private handleError(error: Response | any) {
        return Promise.reject(new HttpError(error.json()));
    }

}
