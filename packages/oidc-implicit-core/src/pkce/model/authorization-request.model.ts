export interface AuthorizationRequest {
   client_id: string;

   scope: string;

   redirect_uri?: string;

   state: string;
}
