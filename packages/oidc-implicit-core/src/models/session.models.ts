/**
 * State
 */
export interface State {
  /**
   * State string
   */
  state: string;
  providerId?: string;
}

export interface ValidSession {
  /**
   * User Session ID is a response given from the token validation call
   * and used to trigger session related calls through backend (i.e. kill all sessions)
   */
  user_session_id: string;
}
