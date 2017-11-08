import { NgModule } from '@angular/core';
import { OidcService } from './src/oidc.service';
export * from './src/oidc.service';
var OidcModule = (function () {
    function OidcModule() {
    }
    /**
     * Use this method in your root module to provide the OidcService
     * @returns {ModuleWithProviders}
     */
    OidcModule.forRoot = function () {
        return {
            ngModule: OidcModule,
            providers: [
                OidcService
            ]
        };
    };
    /**
     * Use this method in your other (non root) modules to import stuff you need
     * @returns {ModuleWithProviders}
     */
    OidcModule.forChild = function () {
        return {
            ngModule: OidcModule,
            providers: [
                OidcService
            ]
        };
    };
    return OidcModule;
}());
export { OidcModule };
OidcModule.decorators = [
    { type: NgModule },
];
/** @nocollapse */
OidcModule.ctorParameters = function () { return []; };
//# sourceMappingURL=index.js.map