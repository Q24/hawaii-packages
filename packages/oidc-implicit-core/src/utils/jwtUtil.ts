import { JWT } from "../models/token.models";

/**
 * transforms an JWT string (e.g. from an access token) to a
 * JWT object.
 *
 * @param token A JWT token string
 * @returns JSON Web Token
 */
export function parseJwt(token: string): JWT {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}
