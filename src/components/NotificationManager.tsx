
import { useEffect } from 'react';

export const NotificationManager = () => {
  useEffect(() => {
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'EVENTS_UPDATED') {
          console.log('Events updated via service worker');
          // Could show a toast notification here
        }
      });
    }

    // Show install prompt for PWA
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button after a delay
      setTimeout(() => {
        if (deferredPrompt && !localStorage.getItem('pwa-install-dismissed')) {
          const installBanner = document.createElement('div');
          installBanner.className = 'fixed bottom-4 left-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
          installBanner.innerHTML = `
            <div>
              <h3 class="font-semibold">Install CampusBoard</h3>
              <p class="text-sm opacity-90">Add to home screen for quick access</p>
            </div>
            <div class="flex space-x-2">
              <button id="install-btn" class="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium">Install</button>
              <button id="dismiss-btn" class="text-white/80 hover:text-white px-2">×</button>
            </div>
          `;
          
          document.body.appendChild(installBanner);
          
          const installBtn = document.getElementById('install-btn');
          const dismissBtn = document.getElementById('dismiss-btn');
          
          installBtn?.addEventListener('click', async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log(`Install prompt outcome: ${outcome}`);
              deferredPrompt = null;
              installBanner.remove();
            }
          });
          
          dismissBtn?.addEventListener('click', () => {
            localStorage.setItem('pwa-install-dismissed', 'true');
            installBanner.remove();
          });
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
};
