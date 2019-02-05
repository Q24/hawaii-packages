import { OidcConfig } from '../models/config.models';

class ConfigService {
  private _config: OidcConfig;

  get config(): OidcConfig {
    return this._config;
  }

  set config(value: OidcConfig) {
    this._config = value;
  }
}

export default new ConfigService();
