import { JsonWebKeySet } from "../discovery/model/jwks.model";
import { OpenIDProviderMetadata } from "../discovery/model/openid-provider-metadata.model";

interface State {
  jwks?: JsonWebKeySet;
  providerMetadata?: OpenIDProviderMetadata;
}

export const state: State = {

}