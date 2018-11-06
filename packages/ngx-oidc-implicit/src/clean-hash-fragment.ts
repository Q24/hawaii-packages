(function (window) {
  // Let's stop the page, so that we can check if there's an access_token in the hash fragment.
  // We need to hide that asap.
  if (window.location.hash.indexOf('token') !== -1) {
    // Save the full hash to sessionStorage
    sessionStorage.setItem('hash_fragment', window.location.hash.substring(1));

    // Modern browsers do this
    if ('pushState' in history) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    } else {
      // Gracefull Degredation
      // Prevent scrolling by storing the page's current scroll offset
      const scrollV = document.body.scrollTop;
      const scrollH = document.body.scrollLeft;

      window.location.hash = '';

      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scrollV;
      document.body.scrollLeft = scrollH;
    }
  }
}(window));
