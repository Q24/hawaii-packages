import type { JWT, JWTPayload } from "../models/token.models";

function decodeJwtPart(jwtPart: string) {
  const base64 = jwtPart.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

/**
 * transforms an JWT string (e.g. from an access token) to a
 * JWT object.
 *
 * @param token A JWT token string
 * @returns JSON Web Token
 */
export function parseJwt<T = JWTPayload>(token: string): JWT<T> {
  const parts = token.split(".");

  const header = parts[0];
  const payload = parts[1];
  const verifySignature = parts[2];

  return {
    header: decodeJwtPart(header),
    payload: decodeJwtPart(payload),
    verifySignature,
  };
}
