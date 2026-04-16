(function () {
    'use strict';

    function initFooterHandler(selector = '.site-footer') {
        const footer = document.querySelector(selector);
        if (!footer) return;

        let lastScrollTop = 0;
        let isFirstScroll = true;

        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Always show footer on pages too short to scroll
            if (documentHeight <= windowHeight + 5) {
                footer.classList.add('visible');
                return;
            }

            // Show footer when scrolling down (first scroll) or near the bottom
            if ((scrollTop > lastScrollTop && isFirstScroll) || (scrollTop + windowHeight >= documentHeight - 100)) {
                footer.classList.add('visible');
                isFirstScroll = false;
            } else if (scrollTop < lastScrollTop && scrollTop + windowHeight < documentHeight - 100) {
                // Hide footer when scrolling up and not near bottom
                footer.classList.remove('visible');
            }

            lastScrollTop = scrollTop;
        }

        // Throttled scroll listener using requestAnimationFrame
        let ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial check on load
        const initialWindowHeight = window.innerHeight;
        const initialDocumentHeight = document.documentElement.scrollHeight;
        if (window.pageYOffset > 0 || initialDocumentHeight <= initialWindowHeight + 5) {
            handleScroll();
        }
    }

    // Auto-init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
        initFooterHandler();
    });

    // Also expose for manual init
    window.initFooterHandler = initFooterHandler;
})();
