"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var oidc_service_1 = require("./src/oidc.service");
__export(require("./src/oidc.service"));
var OidcModule = /** @class */ (function () {
    function OidcModule() {
    }
    OidcModule_1 = OidcModule;
    /**
     * Use this method in your root module to provide the OidcService
     * @returns {ModuleWithProviders}
     */
    OidcModule.forRoot = function () {
        return {
            ngModule: OidcModule_1,
            providers: [
                oidc_service_1.OidcService
            ]
        };
    };
    /**
     * Use this method in your other (non root) modules to import stuff you need
     * @returns {ModuleWithProviders}
     */
    OidcModule.forChild = function () {
        return {
            ngModule: OidcModule_1,
            providers: [
                oidc_service_1.OidcService
            ]
        };
    };
    OidcModule = OidcModule_1 = __decorate([
        core_1.NgModule()
    ], OidcModule);
    return OidcModule;
    var OidcModule_1;
}());
exports.OidcModule = OidcModule;
