// Theme Toggle & Interactive Effects

// Theme Toggle Handler
const toggle = document.getElementById("themeToggle");

function updateToggleIcon() {
    if (!toggle) return;
    const theme = document.body.getAttribute("data-theme");
    const icon = toggle.querySelector('i');
    if (!icon) return;

    if (theme === "dark") {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        toggle.title = "Switch to Light Mode";
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
        toggle.title = "Switch to Dark Mode";
    }
}

if (toggle) {
    toggle.addEventListener("click", () => {
        const theme = document.body.getAttribute("data-theme");
        if (theme === "dark") {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            document.body.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        updateToggleIcon();
    });
}

// Load saved theme on load
const applySavedTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.setAttribute("data-theme", "dark");
    } else if (savedTheme === "light") {
        document.body.removeAttribute("data-theme");
    } else {
        // System preference default
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute("data-theme", "dark");
        } else {
            document.body.removeAttribute("data-theme");
        }
    }
    updateToggleIcon();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySavedTheme);
} else {
    applySavedTheme();
}

// Mouse glow interaction for metric cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.metric-card, .feature-card, .pricing-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Global alert utility (Unified alert system)
window.showAlert = function(message, type = 'info') {
    const container = document.querySelector('main.container');
    if (!container) return;

    // Remove any existing alerts first to avoid stack-up
    const existingAlerts = container.querySelectorAll('.alert-dismissible');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 4000);
};
