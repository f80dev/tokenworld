import {inject, Injectable} from '@angular/core';
import {catchError, retry, throwError, timeout} from "rxjs";
import {$$, hashCode} from "../tools";
import {environment} from "../environments/environment";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  online: boolean = true;
  private cache$: any = {};
  private cacheTime: any = {};
  private cacheExpiry = 300000; // Five minutes
  server_nfluent: string = environment.server;
  httpClient=inject(HttpClient)

  constructor() { }

  refreshCacheIfNeeded(cache_id: string, cacheDelay = 300): void {
    if (this.cacheTime.hasOwnProperty(cache_id) && (new Date().getTime() - this.cacheTime[cache_id].getTime()) > cacheDelay * 1000) {
      this.cache$[cache_id] = null;
      this.cacheTime[cache_id] = null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      if (error.statusText === "TimeoutError") {
        this.online = false;
      }
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Problème technique. Serveur probablement injoignable'));
  }


  _service(name:string,params="",domain="https://api.multiversx.com/",withException=true) : Promise<any[]> {
    return new Promise((resolve,reject)=> {
      this._get(domain+name,params).subscribe((response:any[])=>{
        resolve(response)
      },(err:any)=>{
        if(!withException){
          resolve([])
        }else{
          reject(err)
        }
      })
    })
  }

  _get(url: string, param: string = "", _timeout = 30000, cacheDelayInSec = 0) {
    if (!url.startsWith("http")) {
      url = "/api/" + url;
      url = this.server_nfluent + url.replace("//", "/").replace("/api/api/", "/api/")
    }
    if (cacheDelayInSec == 0) {
      $$("Appel de " + url + "?" + param)
      return this.httpClient.get<any>(url + "?" + param).pipe(retry(2), timeout(_timeout), catchError(this.handleError))
    }

    let cache_id = hashCode(url + "?" + param).toString(16)
    this.refreshCacheIfNeeded(cache_id, cacheDelayInSec)
    if (!this.cache$.hasOwnProperty(cache_id)) {
      $$(cache_id + " - Appel de " + url + "?" + param)
      this.cache$[cache_id] = this.httpClient.get<any>(url + "?" + param).pipe(retry(2), timeout(_timeout), catchError(this.handleError))
      this.cacheTime[cache_id] = new Date();
    }

    return this.cache$[cache_id];
  }


  _post(url: string, param: string = "", body = {}, _timeout = 30000) {
    if (!url.startsWith("http")) {
      url = "/api/" + url;
      url = this.server_nfluent + url.replace("//", "/").replace("/api/api/", "/api/")
    }
    return this.httpClient.post<any>(url + "?" + param, body).pipe(retry(1), timeout(_timeout), catchError(this.handleError))
  }

  _delete(url: string, param: string = "") {
    if (!url.startsWith("http")) {
      url = "/api/" + url;
      url = this.server_nfluent + url.replace("//", "/").replace("/api/api/", "/api/")
    }
    return this.httpClient.delete(url + "?" + param).pipe(retry(1), timeout(2000), catchError(this.handleError))
  }

}
