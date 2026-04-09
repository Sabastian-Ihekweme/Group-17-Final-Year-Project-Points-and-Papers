import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus() {
  // useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useSyncExternalStore(
    subscribe, 
    () => navigator.onLine, // Client-side value
    () => true             // Server-side value (default to true)
  );
}