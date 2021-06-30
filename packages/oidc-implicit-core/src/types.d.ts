declare module "jsrsasign-reduced" {
  export const KEYUTIL = {
    getKey(
      param:
        | RSAKey
        | ECCPrivateKey
        | KJUR.crypto.ECDSA
        | KJUR.crypto.DSA
        | KJUR.jws.JWS.JsonWebKey
        | { n: string; e: string }
        | string,
      passcode?: string | null,
      hextype?: string,
    ): RSAKey | KJUR.crypto.DSA | KJUR.crypto.ECDSA;,
  };
  export const KJUR = {
    jws: {
      JWS: {
        verify(
          sJWS: string,
          key: string,
          acceptAlgs?:
            | string[]
            | { b64: string }
            | { hex: string }
            | { utf8: string },
        ): boolean;,
      },
    },
  };
}
