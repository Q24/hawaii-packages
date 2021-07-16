import { AuthResult } from "../jwt/index";
import { createCodeChallenge } from "./code-challenge";
import { storeAndGetNewCodeVerifier } from "./code-verifier";

export function pkce(): AuthResult {
  
  // Create code verifier
  const code_verifier = storeAndGetNewCodeVerifier();
  
  // Encode code verifier to get code challenge
  const code_challenge = createCodeChallenge(code_verifier);
  
  // Send code challenge to server -> server returns authorization code
  
  // Send Authorization code and code verifier to token endpoint -> server returns access token
}