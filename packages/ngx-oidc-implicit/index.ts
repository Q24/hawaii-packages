import { NgModule, ModuleWithProviders } from '@angular/core';
import { OidcService } from './src/oidc.service';

export * from './src/oidc.service';


@NgModule()
export class OidcModule {
  /**
   * Use this method in your root module to provide the OidcService
   * @returns {ModuleWithProviders}
   */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OidcModule,
      providers: [
        OidcService
      ]
    };
  }

  /**
   * Use this method in your other (non root) modules to import stuff you need
   * @returns {ModuleWithProviders}
   */
  static forChild(): ModuleWithProviders {
    return {
      ngModule: OidcModule,
      providers: [
        OidcService
      ]
    };
  }
}
