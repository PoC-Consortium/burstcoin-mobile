import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Observable, ReplaySubject } from 'rxjs/Rx';

@Injectable()
export class MarketService {

    constructor(private http: Http) {

    }

    /*
    * Get Currency Data from coinmarketcap
    * TODO Provide interface, for eas swap of currency data provider
    */
    public getCurrency(currency = undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            let query: string = ""
            if (currency != undefined) {
                query = "?convert=" + currency
            }
            this.http.get("https://api.coinmarketcap.com/v1/ticker/burst" + query, this.getRequestOptions())
                .toPromise()
                .then(response => { console.log("dqw12"); resolve(response.json() || {}); })
                .catch(this.handleError);
        });
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
        // TODO proper error handling
        //return Promise.reject(new HttpError(error.json()));
    }

}
