'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Workbox } from 'workbox-window';
import { Button } from '@/components/ui/button';

export function SWUpdater() {
    const { toast } = useToast();
    useEffect(() => {
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
                action: <Button onClick={update}>Reload</Button>,
            })
        });

        wb.register();
    }, [toast])

    return null;
}
