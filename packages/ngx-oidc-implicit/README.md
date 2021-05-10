# OIDC Module

A wrapper for use with Angular on the [OIDC Implicit Core package](https://github.com/Q24/hawaii-packages/tree/master/packages/oidc-implicit-core). This package uses the static methods from that library and wraps them with Observables where neccessary.


## Features

* For use with Angular 6 onwards
* Supports OpenID Connect Implicit Flow
* Multiple Provider ID's possible in one browser window (scoped tokens)
* AOT build
* CSRF Tokens

## Installation

```sh
npm install @hawaii-framework/oidc-implicit-core @hawaii-framework/ngx-oidc-implicit
```


## Config

Create a constants file (with an Injection Token) within the src dir somewhere with the following code:

```typescript
import {OidcConfig} from '@hawaii-framework/ngx-oidc-implicit';
import {InjectionToken} from '@angular/core';

export let OIDC_CONFIG_CONSTANTS = new InjectionToken<OidcConfig>('sso-config.constants');

export const OidcConfigDefaults: OidcConfig = {
    response_type: 'id_token token',
    authorisation: `{{ AUTHORISATION URL }}`,
    post_logout_redirect_uri: `{{ POST LOGOUT REDIRECT URL }}`,
    scope: '{{ SCOPES }}',
    token_type: 'Bearer',
    authorize_endpoint: `{{ AUTHORIZE ENDPOINT }}`,
    csrf_token_endpoint: `{{ CSRF ENDPOINT }}`,
    validate_token_endpoint: `{{ TOKEN VALIDATION ENDPOINT }}`,
    is_session_alive_endpoint: `{{ USER SESSION ENDPOINT }}`,
    redirect_uri: `{{ DEFAULT REDIRECT URI }}`,
    login_endpoint: `{{ LOGIN ENDPOINT }}`,
    logout_endpoint: `{{ LOGOUT ENDPOINT }}`,
    restricted_redirect_uris: [`{{ LIST OF COMMA SEPERATE URL PARTS TO RESTRICT AS REDIRECT URL }}`],
    post_logout_provider_ids_to_be_cleaned: [`{{ LIST OF COMMA SEPERATE CLIENT ID'S IN USE WITH THIS SSO SERVER }}`],
    silent_refresh_uri: `{{ SILENT REFRESH LOCATION, THIS IS USUALLY JUST AN EMTPY HTML FILE LCOATED SOMEWHERE }}`,
    silent_logout_uri: `{{ YOUR FRONTEND LOGOUT URL, TO BE USED IN THE SILENT LOGOUT IFRAME }}`,
    provider_id: '{{ PROVIDER ID }}',
    client_id: '{{ CLIENT ID }}',
};
```


## Implementation

### `app.module.ts`

Add to your App Module as forRoot for a single instance across the project.

```typescript
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        OidcModule.forRoot(),
    ],
    providers: [
        {provide: SSO_CONFIG_CONSTANTS, useValue: SsoConfigConstants},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
```

### `auth.guard.ts`

In your scaffolded setup, add a Guard. If you're using multiple lazy loaded modules, make sure you add the guard to your Shared Module

```typescript
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private _oidcService: OidcService,
                @Inject(SSO_CONFIG_CONSTANTS) private _ssoConfigConstants: OidcConfig,
                @Inject(APP_CONSTANTS) private _appConstants: AppConstantsModel,
                private _pls: PathLocationStrategy,
                private _router: Router) {
        this._oidcService.config = this._ssoConfigConstants;
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> {

        return new Observable(observer => {
            const port: string = window.location.port,
                protocol: string = window.location.protocol,
                hostname: string = window.location.hostname,
                baseRedirectUri = `${protocol}//${hostname}${port ? `:${port}` : ''}`,
                localToken = this._oidcService.getStoredToken();

            // Set the current URL as redirect
            let redirectURI = `${baseRedirectUri}${this._pls.getBaseHref()}${state.url}`;

            // Check if we can redirect to this uri, if not, go to default
            this._oidcService.config.restricted_redirect_uris.forEach(restrictedUriPart => {
                if (state.url.indexOf(restrictedUriPart) !== -1) {
                    redirectURI = `${baseRedirectUri}`;
                }
            });

            // Set the redirect uri in this instance
            this._oidcService.config.redirect_uri = redirectURI;

            // Do the session check
            this._oidcService.checkSession()
                .pipe(
                    first()
                )
                .subscribe((authenticated: boolean) => {
                        // Check if the token expires in the next (x) seconds,
                        // if so, set trigger a silent refresh of the Access Token in the OIDC Service.
                        if (localToken && localToken.expires - Math.round(new Date().getTime() / 1000.0) < 3000) {
                            this._oidcService.silentRefreshAccessToken().subscribe();
                        }

                        // Set the next value to authenticated value
                        // Complete the observer
                        observer.next(authenticated);
                        observer.complete();
                    },
                    () => {
                        // Do something with the error, because most likely your OIDC provider is down.
                    }
                );
        });
    }
}
```

### `someModule-routing.modules.ts`

Use the guard on routes:

```ts
const routes: Routes = [
    {
        path: '',
        component: SomeComponent,
        canActivate: [AuthGuard],
    },
];
```

### adding the bearer token to rest-calls
Example of adding Bearer header to rest calls. I use a service wrapper for this:

```ts
@Injectable()
export class RestService {

    private _headers = new HttpHeaders();

    constructor(private _http: HttpClient,
                @Inject(SSO_CONFIG_CONSTANTS) private _ssoConfigConstants: OidcConfig,
                private _oidcService: OidcService){

        // Set the config according to globals set for this app
        this._oidcService.config = this._ssoConfigConstants;


        // Append the JSON content type header
        this._headers = this._headers.set('Content-Type', 'application/json');
    }

    public get(url: string, requiresAuthHeaders: boolean, queryParams?: object | undefined): Observable<any> {
        const options: any = {};

        if (requiresAuthHeaders) {
            this._setAuthHeader();
        }

        let params = new HttpParams();
        if (queryParams) {

            Object.keys(queryParams)
                .map(key => {
                    params = params.set(key, queryParams[key]);
                });

            options.params = params;
        }


        options.headers = this._headers;

        return this._http
            .get(url, options)
            .pipe(catchError((err: HttpErrorResponse) => {
                return observableThrowError(err.error);
            }));
    }

    public post(url: string, data: any, requiresAuthHeaders: boolean): Observable<any> {

        if (requiresAuthHeaders) {
            this._setAuthHeader();
        }

        return this._http
            .post(url, data, {
                headers: this._headers
            })
            .pipe(catchError((err: HttpErrorResponse) => {
                return observableThrowError(err.error);
            }));
    }

    public put(url: string, data: any, requiresAuthHeaders: boolean): Observable<any> {

        if (requiresAuthHeaders) {
            this._setAuthHeader();
        }

        return this._http
            .put(url, data, {
                headers: this._headers
            })
            .pipe(catchError((err: HttpErrorResponse) => {
                return observableThrowError(err.error);
            }));
    }

    public patch(url: string, data: any, requiresAuthHeaders: boolean): Observable<any> {

        if (requiresAuthHeaders) {
            this._setAuthHeader();
        }

        return this._http
            .patch(url, data, {
                headers: this._headers
            })
            .pipe(catchError((err: HttpErrorResponse) => {
                return observableThrowError(err.error);
            }));
    }

    public delete(url: string): Observable<any> {
        this._setAuthHeader();
        return this._http.delete(url, {
                headers: this._headers
            })
            .pipe(catchError((err: HttpErrorResponse) => {
                return observableThrowError(err.error);
            }));
    }

    private _setAuthHeader() {
        // Get local token from the OIDC Service
        const localToken = this._oidcService.getStoredToken();

        // Check if local token is there
        if (localToken) {

            // Set the header
            this._headers = this._headers.set('Authorization', this._oidcService.getAuthHeader());

            // Check if the token expires in the next (x) seconds,
            // if so, set trigger a silent refresh of the Access Token in the OIDC Servic
            if (localToken.expires - Math.round(new Date().getTime() / 1000.0) < 3000) {
                this._oidcService.silentRefreshAccessToken().subscribe();
            }
        }

        // There's no local token present, so do a checkSession to get a new one
        else {
            this._oidcService.checkSession()
                .subscribe((loggedIn: boolean) => {
                    if (loggedIn) {
                        this._setAuthHeader();
                    }
                });
        }
    }
}
```

### custom login page

You can configure a custom login page, that's part of the angular stack, therefore there is a login endpoint in the config.
Make sure you point the OIDC config to the proper URL within the angular stack. After that a login page is pretty straight forward.
The form should (for security purposes) be a classic form HTTP POST.

Here is the bare basics:

#### `login.component.html`

```html
<form ngNoForm
      action="{{ oidcService.config.login_endpoint }}"
      method="post">
    <fieldset>
        <legend>Log In</legend>

        <!-- CSRF Token -->
        <input type="hidden" name="_csrf" [formControl]="_csrf">

        <!-- Email or username -->
        <input type="email"
               id="j_username"
               [formControl]="j_username"
               name="j_username">

        <!-- Password-->
        <input type="password"
               id="j_password"
               [formControl]="j_password"
               name="j_password"
               autocomplete="off">

        <!-- Submit -->
        <button>Log In</button>
    </fieldset>
</form>
```

#### `login.component.ts`

```typescript
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {

    /**
     * CSRF token
     * @type {FormControl}
     * @private
     */
    public _csrf: FormControl = new FormControl('', Validators.required);
    /**
     * Username or E-mail address
     * @type {FormControl}
     */
    public j_username: FormControl = new FormControl('', Validators.required);

    /**
     * Password form
     * @type {FormControl}
     */
    public j_password: FormControl = new FormControl('', Validators.required);

    constructor(public oidcService: OidcService,
                @Inject(SSO_CONFIG_CONSTANTS) private _ssoConfigConstants: OidcConfig,
              ) {

        this.oidcService.config = this._ssoConfigConstants;
    }

    ngOnInit() {
        this.oidcService.getCsrfToken()
            .subscribe(
                (token: CsrfToken) => this._csrf.setValue(token.csrf_token));
    }
}
```

## Publishing

`npm publish dist`
