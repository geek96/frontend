import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { ErrorHandler } from '../utils/error-handler.utils';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { UserService } from './user.service';
import { ApiConfig } from '../utils/api-config.utils';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Store } from '@ngrx/store';

@Injectable()
export class APIHandlerService extends ApiConfig {

    constructor(
        private http: HttpClient,
        private userService: UserService,
    ) {
        super(userService);
    }

  private errorHandler(err: HttpResponse<any>) {
    let bodyError = null;
    if (err.status === 401) {
      if (err['_body'] && err['_body'].constructor === String) {
        bodyError = (err['_body'].indexOf('{') > -1) ? JSON.parse(err['_body'])['message'] : null;
      }
      throw (err || 'Server error');
    } else if (err.status === 404) {
      throw (err.statusText || 'Resource not found');
    }
    return Observable.throw(err || 'Server error');
  }

  public callService(method: string = 'POST', path: string = '', data?: string | Object): Observable<any> {
    this.headers = { headers: this.setHeaders() };
    method = method.toUpperCase();
    let url = `${APIHandlerService.API_DEFAULT_URL}${path}`;
    if (data === undefined || data === null) {
      data = ' ';
    }
    switch (method) {
      case 'POST':
        return this.http.post(url, (data || {}), this.headers)
          .catch(this.errorHandler)
          .retryWhen((errors) => {
            return errors
              .mergeMap((error) => this.errorHandler(error))
              .delay(1000)
              .take(2);
          })
          .map((res: HttpResponse<any>) => res);
      case 'PUT':
        return this.http.put(url, (data || {}) || {}, this.headers)
          .retryWhen((errors) => {
            return errors
              .mergeMap((error) => this.errorHandler(error))
              .delay(1000)
              .take(2);
          })
          .catch(this.errorHandler)
          .map((res: HttpResponse<any>) => res);
      case 'GET':
        url = this.checkGetMark(url);
        return this.http.get(`${url}`, this.headers)
          .catch(this.errorHandler)
          .retryWhen((errors) => {
            return errors
              .mergeMap((error) => this.errorHandler(error))
              .delay(1000)
              .take(2);
          })
          .map((res: HttpResponse<any>) => res);
      case 'DELETE':
        url = this.checkGetMark(url);
        return this.http.delete(`${url}`, this.headers)
          .retryWhen((errors) => {
            return errors
              .mergeMap((error) => this.errorHandler(error))
              .delay(1000)
              .take(2);
          })
          .catch(this.errorHandler)
          .map((res: HttpResponse<any>) => res);
      default:
        throw new Error('Request Method does not exist');
    }

  }

  public post(path: string, data?: any): Observable<any> {
    this.headers = { headers: this.setHeaders() };
    const url = `${APIHandlerService.API_DEFAULT_URL}${path}`;

    return this.http.post(url, (data || {}), this.headers)
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  public postDirect(path: string, data?: any): Observable<any> {
    this.headers = { headers: this.setHeaders() };
    const url = `${APIHandlerService.API_DEFAULT_URL}${path}`;
    return this.http.post(url, data || {}, this.headers)
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  public put(path: string, data?: Object): Observable<any> {
    this.headers = { headers: this.setHeaders() };
    this.authToken = this.userService.getAuthUser();
    const url = `${APIHandlerService.API_DEFAULT_URL}${path}`;
    return this.http.put(url, (data || {}) || {}, this.headers)
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  public get(path: string): Observable<any> {
    const options = {
      headers: this.setHeaders(),
    };
    const url = `${APIHandlerService.API_DEFAULT_URL}${path}`;
    return this.http.get(`${url}`, options)
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  public delete(path: string): Observable<any> {
    this.headers = { headers: this.setHeaders() };
    let url = `${APIHandlerService.API_DEFAULT_URL}${path}`;
    url = this.checkGetMark(url);
    return this.http.delete(`${url}`, this.headers)
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  public upload(path: string, data?: Object): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': ''});
    console.log(headers);
    return this.http.put(path, (data || {}) || {}, {headers})
      .retryWhen((errors) => {
        return errors
          .mergeMap((error) => this.errorHandler(error))
          .delay(1000)
          .take(2);
      })
      .catch(this.errorHandler)
      .map((res: HttpResponse<any>) => res);
  }

  private checkGetMark(url) {
    if (url.indexOf('?') > -1) {
      return `${url}`;
    } else {
      return `${url}`;
    }
  }
}