/**
 * destroy an iframe in a IE11 friendly-manner.
 * @param iFrame the iframe to destroy
 */
export function destroyIframe(iFrame: HTMLIFrameElement): void {
  // We use parent.removeChild instead of element.remove to support IE.
  iFrame.parentElement!.removeChild(iFrame);
}
