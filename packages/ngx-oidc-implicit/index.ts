import { ModuleWithProviders, NgModule } from '@angular/core';
import { OidcService } from './src/oidc.service';
import { LogService } from './src/services';
import { OidcConfig } from './src/models';

export * from './src/models';
export * from './src/constants/authorize.constants';
export * from './src/oidc.service';
export * from './src/utils';

@NgModule()
export class OidcModule {
  /**
   * Use this method in your root module to provide the OidcService
   * @returns {ModuleWithProviders}
   */
  static forRoot(config: OidcConfig): ModuleWithProviders {
    return {
      ngModule: OidcModule,
      providers: [
        {
          provide: OidcService,
          useValue: config,
        },
        LogService,
      ],
    };
  }
}
