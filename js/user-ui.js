// User UI Update - Common script for all pages
// This script updates the user interface to show logged-in user info

function updateUserUI() {
    // Check if authService is available
    if (typeof authService === 'undefined') {
        console.warn('⚠️ authService not loaded yet');
        return;
    }

    const user = authService.getCurrentUser();
    const loginBtn = document.querySelector('a[href="login.html"]');

    console.log('👤 Updating user UI:', { user: user ? user.name : 'Not logged in', loginBtn: !!loginBtn });

    if (user && loginBtn) {
        const avatarHtml = user.avatar
            ? `<img src="${user.avatar}" class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)] hover:shadow-[0_0_20px_rgba(242,242,13,0.6)] transition-all" alt="Tài khoản cá nhân" />`
            : `<div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)]">
                   ${user.name.charAt(0).toUpperCase()}
               </div>`;

        loginBtn.outerHTML = `
            <div class="flex items-center gap-4">
                <a href="profile.html" class="flex items-center gap-2 hover:text-primary transition-colors group">
                    ${avatarHtml}
                    <span class="hidden md:inline text-sm font-semibold group-hover:text-primary">${user.name}</span>
                </a>
            </div>
        `;
        console.log('✅ User UI updated successfully');
    } else if (!user) {
        console.log('ℹ️ No user logged in');
    } else if (!loginBtn) {
        console.log('⚠️ Login button not found in DOM');
    }
}

// Auto-update UI when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 DOM loaded, updating user UI...');
    updateUserUI();
});

// Also try to update after a short delay (in case auth.js loads late)
setTimeout(updateUserUI, 100);
