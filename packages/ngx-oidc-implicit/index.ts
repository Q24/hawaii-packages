import { ModuleWithProviders, NgModule } from '@angular/core';
import { OidcService } from './src/oidc.service';

export * from '@hawaii-framework/oidc-implicit-core/dist';
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
        OidcService,
      ],
    };
  }
}
