export interface Log {
  /**
   * Debug (Normal debug)
   * @param {string} primaryMessage
   * @param supportingData
   */
  debug(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Warning log (yellow)
   * @param {string} primaryMessage
   * @param supportingData
   */
  warn(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Error log (red)
   * @param {string} primaryMessage
   * @param supportingData
   */
  error(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Info log (blue)
   * @param {string} primaryMessage
   * @param supportingData
   */
  info(primaryMessage: string, ...supportingData: any[]): void;
}
