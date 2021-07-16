import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import {
  OidcConfig,
  config,
  configure,
  AuthResult,
  CsrfResult,
  getCsrfResult,
  getStoredCsrfResult,
  getStoredAuthResult,
  getAuthHeader,
  getIdTokenHint,
  cleanSessionStorage,
  deleteStoredAuthResults,
  isSessionAlive,
  checkSession,
  silentRefresh
} from '@hawaii-framework/oidc-implicit-core';

/**
 * Open ID Connect Implicit Flow Service for Angular
 */
@Injectable({ providedIn: 'root' })
export class OidcService {
  get config(): OidcConfig {
    return config;
  }

  set config(value: OidcConfig) {
    configure(value);
  }

  getCsrfResult(): Observable<CsrfResult> {
    return new Observable<CsrfResult>((observer) => {
      getCsrfResult().then((csrfResult) => {
        observer.next(csrfResult);
        observer.complete();
      });
    });
  }

  getStoredCsrfToken(): string | null {
    return getStoredCsrfResult();
  }

  getStoredAuthResult(): AuthResult | null {
    return getStoredAuthResult();
  }

  getAuthHeader(): string | null {
    const authResult = this.getStoredAuthResult();
    if (authResult) {
      return getAuthHeader(authResult);
    }
    return null;
  }

  getIdTokenHint(options = { regex: false }): string | null {
    return getIdTokenHint(options);
  }

  cleanSessionStorage(): void {
    cleanSessionStorage();
  }

  deleteStoredAuthResults(): void {
    deleteStoredAuthResults();
  }

  isSessionAlive(): Observable<{ status: number }> {
    return new Observable<{ status: number }>(
      (observer: Observer<{ status: number }>) => {
        isSessionAlive().then(
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
      checkSession().then(
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

  silentRefresh(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      silentRefresh().then(
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
}
