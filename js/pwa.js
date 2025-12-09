// PWA Registration Script for all pages
// This script should be included in all HTML pages for PWA functionality

(function () {
    // Get the base path to the root (handles subfolders like admin/, student/)
    const getBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/admin/') || path.includes('/student/')) {
            return '../';
        }
        return './';
    };

    const basePath = getBasePath();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(basePath + 'sw.js')
                .then(reg => console.log('✅ Service Worker registered'))
                .catch(err => console.log('❌ SW registration failed:', err));
        });
    }

    // PWA Install Prompt
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Create install prompt UI if not exists
        if (!document.getElementById('pwaInstallPrompt')) {
            const promptDiv = document.createElement('div');
            promptDiv.id = 'pwaInstallPrompt';
            promptDiv.innerHTML = `
                <span style="margin-right:15px;">📱 Install ITI COPA App</span>
                <button id="pwaInstallBtn" style="background:#fff; color:#6366f1; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600;">Install</button>
                <button id="pwaDismissBtn" style="background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.3); padding:8px 16px; border-radius:8px; cursor:pointer; margin-left:8px;">Later</button>
            `;
            promptDiv.style.cssText = 'display:none; position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #6366f1, #4f46e5); color:white; padding:15px 25px; border-radius:12px; box-shadow:0 10px 40px rgba(99,102,241,0.4); z-index:9999; font-family:Inter,sans-serif;';
            document.body.appendChild(promptDiv);

            document.getElementById('pwaInstallBtn').addEventListener('click', installPWA);
            document.getElementById('pwaDismissBtn').addEventListener('click', dismissInstall);
        }

        // Show install button after 3 seconds
        setTimeout(() => {
            document.getElementById('pwaInstallPrompt').style.display = 'block';
        }, 3000);
    });

    function installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(result => {
                if (result.outcome === 'accepted') {
                    console.log('✅ PWA installed');
                }
                deferredPrompt = null;
                document.getElementById('pwaInstallPrompt').style.display = 'none';
            });
        }
    }

    function dismissInstall() {
        document.getElementById('pwaInstallPrompt').style.display = 'none';
    }

    // Expose functions globally
    window.installPWA = installPWA;
    window.dismissInstall = dismissInstall;
})();
