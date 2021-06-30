export function validateAccessToken(token: AccessToken) {
  // (1) Hash the octets of the ASCII representation of the access_token with
  // the hash algorithm specified in JWA [JWA] for the alg Header Parameter of
  // the ID Token's JOSE Header. For instance, if the alg is RS256, the hash
  // algorithm used is SHA-256. (2) Take the left-most half of the hash and
  // base64url-encode it. (3) The value of at_hash in the ID Token MUST match
  // the value produced in the previous step if at_hash is present in the ID
  // Token.
}
