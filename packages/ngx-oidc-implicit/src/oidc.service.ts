import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { CsrfToken, OidcConfig, SessionService, SessionUtil, StorageUtil, Token, TokenService } from '@hawaii-framework/oidc-implicit-core/dist';
import configService from '@hawaii-framework/oidc-implicit-core/dist/services/config.service';

/**
 * Open ID Connect Implicit Flow Service for Angular
 */
@Injectable({providedIn: 'root'})
export class OidcService {

  get config(): OidcConfig {
    return configService.config;
  }

  set config(value: OidcConfig) {
    configService.config = value;
  }

  getCsrfToken(): Observable<CsrfToken> {
    return new Observable<CsrfToken>((observer: Observer<CsrfToken>) => {
      TokenService.getCsrfToken()
        .then(
          (csrfToken: CsrfToken) => {
            observer.next(csrfToken);
            observer.complete();
          });
    });
  }

  getStoredCsrfToken(): string {
    return StorageUtil.read('_csrf');
  }

  getStoredToken(): Token | null {
    return TokenService.getStoredToken();
  }

  getAuthHeader(): string {
    return SessionUtil.getAuthHeader(TokenService.getStoredToken());
  }

  getIdTokenHint(): string | null {
    return TokenService.getIdTokenHint();
  }

  cleanSessionStorage(providerIDs: string[] = this.config.post_logout_provider_ids_to_be_cleaned): void {
    SessionService.cleanSessionStorage(providerIDs);
  }

  deleteStoredTokens(): void {
    TokenService.deleteStoredTokens();
  }

  isSessionAlive(): Observable<{ status: number }> {
    return new Observable<{ status: number }>((observer: Observer<{ status: number }>) => {
      SessionService.isSessionAlive()
        .then(
          (status: { status: number }) => {
            observer.next(status);
            observer.complete();
          },
          (err: HttpErrorResponse) => observer.error(err));
    });
  }

  checkSession(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      SessionService.checkSession()
        .then(
          (hasSession: boolean) => {
            observer.next(hasSession);
            observer.complete();
          },
          () => {
            observer.next(false);
            observer.complete();
          });
    });
  }

  silentRefreshAccessToken(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      SessionUtil.silentRefreshAccessToken()
        .then(
          (refreshed: boolean) => {
            observer.next(refreshed);
            observer.complete();
          },
          () => {
            observer.next(false);
            observer.complete();
          });
    });
  }

  silentLogoutByUrl(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      SessionUtil.silentLogoutByUrl()
        .then(
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
