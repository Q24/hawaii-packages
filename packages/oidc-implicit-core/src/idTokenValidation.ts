import { IdToken } from "./models/IdToken.models";
import { OidcConfigService } from "./services/config.service";
import { GeneratorUtil } from "./utils/generatorUtil";
import { parseJwt } from "./jwt/parseJwt";
import { getNonce } from "./utils/nonceUtil";
import { KEYUTIL, KJUR } from "jsrsasign-reduced";
import { LogUtil } from "./utils/logUtil";
import { validateJwtString } from "./jwt/validateJwtString";
import type { JWTHeader } from "./models/jwt-header.models";
import { JsonWebKeySet } from "./models/jwk.models";

const keyAlgorithms = [
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "PS256",
  "PS384",
  "PS512",
];

function validSignature(
  idTokenString: string,
  jwks: JsonWebKeySet,
  headerData: JWTHeader,
): boolean {
  if (!jwks.keys) {
    return false;
  }

  if (!headerData.alg) {
    LogUtil.warn("ID Token has invalid JOSE Header");
    return false;
  }

  const kid = headerData.kid;
  const alg = headerData.alg;

  if (!keyAlgorithms.includes(alg as string)) {
    LogUtil.warn("alg not supported", alg);

    return false;
  }

  // No kid in the Jose header
  if (kid) {
    const keyToValidate = jwks.keys.find((key) => key.kid === kid);
    const publicKey = KEYUTIL.getKey(keyToValidate);
    const isValid = KJUR.jws.JWS.verify(idTokenString, publicKey, [alg]);
    if (!isValid) {
      LogUtil.warn("incorrect Signature, validation failed for id_token");
    }
    return isValid;
  } else {
    const jwtKtyToUse = alg.charAt(0) === "E" ? "EC" : "RSA";
    let keyToValidate;

    // If only one key, use it
    if (jwks.keys.length === 1 && jwks.keys[0].kty === jwtKtyToUse) {
      keyToValidate = jwks.keys[0];
    } else {
      // More than one key
      // Make sure there's exactly 1 key candidate
      // kty "RSA" and "EC" use "sig"
      const matchingKeys = jwks.keys.filter(
        (key) => key.kty === jwtKtyToUse && key.use === "sig",
      );

      if (matchingKeys.length > 1) {
        LogUtil.warn(
          "no ID Token kid claim in JOSE header and multiple supplied in jwks_uri",
        );
        return false;
      }
      keyToValidate = matchingKeys[0];
    }

    if (!keyToValidate) {
      LogUtil.warn(
        "no keys found, incorrect Signature, validation failed for id_token",
      );

      return false;
    }

    const isValid = KJUR.jws.JWS.verify(
      idTokenString,
      KEYUTIL.getKey(keyToValidate),
      [alg],
    );

    if (!isValid) {
      LogUtil.warn("incorrect Signature, validation failed for id_token");
    }

    return isValid;
  }
}

function hasClientIdAudience(idToken: IdToken) {
  return idToken.aud.includes(OidcConfigService.config.client_id);
}

function hasOnlyTrustedAudiences(idToken: IdToken) {
  if (typeof idToken.aud === "string") {
    return idToken.aud === OidcConfigService.config.client_id;
  }
  return idToken.aud.every((audience) => {
    if (idToken.aud === OidcConfigService.config.client_id) {
      return true;
    }
    return OidcConfigService.config.trusted_audiences.includes(audience);
  });
}

function hasMultipleAudiences(idToken: IdToken) {
  return typeof idToken.aud !== "string" && idToken.aud.length > 1;
}

function hasAzpClaim(idToken: IdToken) {
  return typeof idToken["azp"] !== "undefined";
}

function azpClaimValid(idToken: IdToken) {
  return idToken["azp"] === OidcConfigService.config.client_id;
}

function tokenIsExpired(idToken: IdToken) {
  return GeneratorUtil.epoch() > idToken.exp;
}

function iatTooOld(idToken: IdToken) {
  return (
    idToken.iat + (OidcConfigService.config.issued_at_threshold || 30) >
    GeneratorUtil.epoch()
  );
}

function nonceIsValid(idToken: IdToken) {
  return getNonce() === idToken.nonce;
}

/**
 * If any of the validation procedures fail, any operations requiring the
 * information that failed to correctly validate will be aborted and the
 * information that failed to validate will not be used.
 *
 * @param idTokenString the id token as JWT string
 */
export function validateIdToken(
  idTokenString: string,
  jwks: JsonWebKeySet,
): void {
  validateJwtString(idTokenString);
  const { header, payload: idTokenPayload } = parseJwt<IdToken>(idTokenString);
  // The Issuer Identifier for the OpenID Provider (which is typically obtained
  // during Discovery) MUST exactly match the value of the iss (issuer) Claim.
  if (idTokenPayload.iss !== OidcConfigService.config.authorization) {
    throw Error("id_token_invalid__issuer_mismatch");
  }

  // The Client MUST validate that the aud (audience) Claim contains its
  // client_id value registered at the Issuer identified by the iss (issuer)
  // Claim as an audience. The ID Token MUST be rejected if the ID Token does
  // not list the Client as a valid audience, or if it contains additional
  // audiences not trusted by the Client.
  if (
    !(
      hasClientIdAudience(idTokenPayload) &&
      hasOnlyTrustedAudiences(idTokenPayload)
    )
  ) {
    throw Error("id_token_invalid__audience_mismatch");
  }

  // If the ID Token contains multiple audiences, the Client SHOULD verify that
  // an azp Claim is present.
  if (hasMultipleAudiences(idTokenPayload) && !hasAzpClaim(idTokenPayload)) {
    throw Error("id_token_invalid__azp_not_present");
  }

  // If an azp (authorized party) Claim is present, the Client SHOULD verify
  // that its client_id is the Claim Value.
  if (hasAzpClaim(idTokenPayload) && !azpClaimValid(idTokenPayload)) {
    throw Error("id_token_invalid__azp_invalid");
  }

  // The Client MUST validate the signature of the ID Token according to JWS
  // [JWS] using the algorithm specified in the alg Header Parameter of the JOSE
  // Header. The Client MUST use the keys provided by the Issuer.
  // TODO

  // The alg value SHOULD be RS256. Validation of tokens using other signing
  // algorithms is described in the OpenID Connect Core 1.0 [OpenID.Core]
  // specification.

  // The current time MUST be before the time represented by the exp Claim
  // (possibly allowing for some small leeway to account for clock skew).
  if (tokenIsExpired(idTokenPayload)) {
    throw Error("id_token_invalid__expired");
  }

  // The iat Claim can be used to reject tokens that were issued too far away
  // from the current time, limiting the amount of time that nonces need to be
  // stored to prevent attacks. The acceptable range is Client specific.
  if (iatTooOld(idTokenPayload)) {
    throw Error("id_token_invalid__iat_too_old");
  }

  // The value of the nonce Claim MUST be checked to verify that it is the same
  // value as the one that was sent in the Authentication Request. The Client
  // SHOULD check the nonce value for replay attacks. The precise method for
  // detecting replay attacks is Client specific.
  if (!nonceIsValid(idTokenPayload)) {
    throw Error("id_token_invalid__nonce_invalid");
  }

  // If the acr Claim was requested, the Client SHOULD check that the asserted
  // Claim Value is appropriate. The meaning and processing of acr Claim Values
  // is out of scope for this document.
  // TODO

  // When a max_age request is made, the Client SHOULD check the auth_time Claim
  // value and request re-authentication if it determines too much time has
  // elapsed since the last End-User authentication.
  // TODO

  if (!idTokenPayload.sub) {
    throw Error("id_token_invalid__no_sub");
  }
  if (!idTokenPayload.iat) {
    throw Error("id_token_invalid__no_iat");
  }

  if (!validSignature(idTokenString, jwks, header)) {
    throw Error("id_token_invalid__invalid_signature");
  }
}
