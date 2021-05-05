import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import {
  OidcService as _OidcService,
  OidcConfig,
  CsrfToken,
  Token,
} from '@hawaii-framework/oidc-implicit-core';

/**
 * Open ID Connect Implicit Flow Service for Angular
 */
@Injectable({ providedIn: 'root' })
export class OidcService {
  get config(): OidcConfig {
    return _OidcService.OidcConfigService.config;
  }

  set config(value: OidcConfig) {
    _OidcService.OidcConfigService.config = value;
  }

  getCsrfToken(): Observable<CsrfToken> {
    return new Observable<CsrfToken>((observer: Observer<CsrfToken>) => {
      _OidcService.getCsrfToken().then((csrfToken: CsrfToken) => {
        observer.next(csrfToken);
        observer.complete();
      });
    });
  }

  getStoredCsrfToken(): string | null {
    return _OidcService.getStoredCsrfToken();
  }

  getStoredToken(): Token | null {
    return _OidcService.getStoredToken();
  }

  getAuthHeader(): string | null {
    const token = this.getStoredToken();
    if (token) {
      return _OidcService.getAuthHeader(token);
    }
    return null;
  }

  getIdTokenHint(options = { regex: false }): string | null {
    return _OidcService.getIdTokenHint(options);
  }

  cleanSessionStorage(): void {
    _OidcService.cleanSessionStorage();
  }

  deleteStoredTokens(): void {
    _OidcService.deleteStoredTokens();
  }

  isSessionAlive(): Observable<{ status: number }> {
    return new Observable<{ status: number }>(
      (observer: Observer<{ status: number }>) => {
        _OidcService.isSessionAlive().then(
          (status: { status: number }) => {
            observer.next(status);
            observer.complete();
          },
          (err: HttpErrorResponse) => observer.error(err),
        );
      },
    );
  }

  checkSession(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      _OidcService.checkSession().then(
        () => {
          observer.next(true);
          observer.complete();
        },
        () => {
          observer.next(false);
          observer.complete();
        },
      );
    });
  }

  silentRefreshAccessToken(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      _OidcService.silentRefreshAccessToken().then(
        () => {
          observer.next(true);
          observer.complete();
        },
        () => {
          observer.next(false);
          observer.complete();
        },
      );
    });
  }

  silentLogoutByUrl(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      _OidcService.silentLogoutByUrl().then(
        (loggedOut: boolean) => {
          observer.next(loggedOut);
          observer.complete();
        },
        () => {
          observer.next(false);
          observer.complete();
        },
      );
    });
  }
}
