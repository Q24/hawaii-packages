export interface IdToken {
  sub: string;
  aud: string | string[];
  iss: string;
  exp: number;
  nonce: string;
  iat: number;
}
