'use client';
import { useEffect } from 'react';
import UpdateToast from '@/components/UpdateToast';
import { useToast } from '@/hooks/use-toast';
import { Workbox } from 'workbox-window';

const register = () => {
  if (process.env.NODE_ENV === 'development' || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  const wb = new Workbox('/sw.js');
  
  wb.addEventListener('waiting', () => {
    // A new service worker has installed, but is waiting to activate.
    // We can show a toast to let the user know.
    const update = () => {
      wb.addEventListener('controlling', () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
    toast({
        title: 'New version available',
        description: 'A new version of the application is available. Please reload to update.',
        action: <button onClick={update} className="p-2 bg-primary text-primary-foreground rounded">Reload</button>,
    })
  });

  wb.register();
}

export function SWUpdater() {
    const { toast } = useToast();
    useEffect(() => {
        register();
    }, [])

    return null;
}
