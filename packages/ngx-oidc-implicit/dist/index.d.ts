import { ModuleWithProviders } from '@angular/core';
export * from './src/oidc.service';
export declare class OidcModule {
    /**
     * Use this method in your root module to provide the OidcService
     * @returns {ModuleWithProviders}
     */
    static forRoot(): ModuleWithProviders;
    /**
     * Use this method in your other (non root) modules to import stuff you need
     * @returns {ModuleWithProviders}
     */
    static forChild(): ModuleWithProviders;
}
