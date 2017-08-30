import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Currency, HttpError } from "../model";

@Injectable()
export class MarketService {

    public currency: BehaviorSubject<any> = new BehaviorSubject(undefined);

    constructor(private http: Http) {
        this.updateCurrency();
    }

    public setCurrency(currency: Currency) {
        this.currency.next(currency);
    }

    /*
    * Get Currency Data from coinmarketcap
    * TODO Provide interface, for easy swap of currency data provider
    */
    public updateCurrency(currency: string = undefined): void {
            let params: URLSearchParams = new URLSearchParams();
            let requestOptions = this.getRequestOptions();
            if (currency != undefined) {
                currency = currency.toLowerCase();
                params.set("convert", currency);
                requestOptions.params = params;
            }
            this.http.get("https://api.coinmarketcap.com/v1/ticker/burst", requestOptions)
                .toPromise()
                .then(response => {
                    let c = response.json() || [];
                    if (c.length > 0) {
                        // set currency for currency object
                        c[0]["currency"] = currency;
                        this.setCurrency(new Currency(c[0]));
                    }
                })
                .catch(error => {
                    console.log("currency update failed");
                });
    }

    public getPriceBurstcoin(coins: number) {
        if (coins % 1 === 0) {
            // whole number
            return coins.toString() + " BURST";
        } else {
            return coins.toFixed(8) + " BURST";
        }
    }

    public getPriceBTC(coins: number) : string {
        return (coins * this.currency.value.priceBTC).toFixed(8) + " BTC";
    }

    public getPriceFiatCurrency(coins: number) : string {
        if (this.currency.value.currency != undefined) {
            return (coins * this.currency.value.priceCur).toFixed(8) + " " + this.currency.value.currency.toUpperCase();
        } else {
            return (coins * this.currency.value.priceUSD).toFixed(8) + " $" ;
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
