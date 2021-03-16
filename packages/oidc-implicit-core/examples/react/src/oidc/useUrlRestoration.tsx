import { useEffect } from 'react';
import { useHistory } from 'react-router';

export const useUrlRestoration = () => {
  const history = useHistory();

  useEffect(() => {
    const urlToRestore = sessionStorage.getItem('url_to_restore');
    if (urlToRestore) {
      const fullUrlToRestore = `${urlToRestore}${history.location.hash}`
      history.push(fullUrlToRestore);
    }
  }, [history]);
};

export const saveUrlToRestore = (url: string) => sessionStorage.setItem('url_to_restore', url)
export const clearUrlToRestore = () => sessionStorage.setItem('url_to_restore', '')