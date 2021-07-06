import { AuthResult } from "../../jwt/model/jwt.model";

export interface AuthResultFilter {
  (authResult: Readonly<AuthResult>): boolean;
}