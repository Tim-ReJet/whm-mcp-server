/**
 * Berg Projects Theme - Enhanced JavaScript
 * ReactorBro Stack Phase 2 AI Enhanced
 * Version: 2.0.0
 *
 * Features:
 * - Smooth scroll animations
 * - Intersection Observer animations
 * - Counter animations for stats
 * - Enhanced navigation interactions
 * - Mobile menu functionality
 * - Performance optimized
 */

(function() {
    'use strict';

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Debounce function for performance
     */
    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Ease out quad function for animations
     */
    function easeOutQuad(t) {
        return t * (2 - t);
    }

    // ========================================================================
    // HEADER SCROLL EFFECT
    // ========================================================================

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;

        const handleScroll = debounce(() => {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 0) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
            }

            lastScroll = currentScroll;
        }, 10);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ========================================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================================================

    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================================================
    // INTERSECTION OBSERVER ANIMATIONS
    // ========================================================================

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.service-card, .trust-item, .hero-content, .hero-visual'
        );

        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            animatedElements.forEach((element, index) => {
                // Set initial state for animation
                element.style.opacity = '0';
                element.style.transform = 'translateY(40px)';
                element.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;

                observer.observe(element);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            animatedElements.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    }

    // ========================================================================
    // ANIMATED COUNTERS FOR TRUST SECTION
    // ========================================================================

    function initCounterAnimations() {
        const counters = document.querySelectorAll('.trust-number');
        let animated = false;

        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        animateCounters();
                        observer.disconnect();
                    }
                });
            }, observerOptions);

            const trustSection = document.querySelector('.trust-section');
            if (trustSection) {
                observer.observe(trustSection);
            }
        } else {
            // Fallback for browsers without IntersectionObserver
            animateCounters();
        }

        function animateCounters() {
            counters.forEach(counter => {
                const target = counter.textContent;
                const isNumber = /^\d+/.test(target);

                if (!isNumber) return;

                const number = parseInt(target.match(/\d+/)[0]);
                const suffix = target.replace(/\d+/, '');
                const duration = 2000;
                const steps = 60;
                const increment = number / steps;
                const stepDuration = duration / steps;
                let current = 0;

                counter.textContent = '0' + suffix;

                const timer = setInterval(() => {
                    current += increment;

                    if (current >= number) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current) + suffix;
                    }
                }, stepDuration);
            });
        }
    }

    // ========================================================================
    // NAVIGATION ACTIVE STATE
    // ========================================================================

    function initNavigationActiveState() {
        const navLinks = document.querySelectorAll('.main-navigation a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;

            if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.style.color = 'var(--color-primary)';
                link.style.background = 'var(--color-primary-50)';
            }
        });
    }

    // ========================================================================
    // BUTTON RIPPLE EFFECT
    // ========================================================================

    function initButtonRipple() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple CSS
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .btn {
                    position: relative;
                    overflow: hidden;
                }
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s ease-out;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========================================================================
    // PARALLAX EFFECT FOR HERO
    // ========================================================================

    function initParallax() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const handleScroll = debounce(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;

            if (scrolled <= window.innerHeight) {
                heroSection.style.transform = `translateY(${rate}px)`;
            }
        }, 10);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ========================================================================
    // MOBILE MENU TOGGLE
    // ========================================================================

    function initMobileMenu() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        // Create mobile menu button if it doesn't exist
        let menuButton = document.querySelector('.mobile-menu-toggle');

        if (!menuButton && window.innerWidth < 768) {
            menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-toggle';
            menuButton.setAttribute('aria-label', 'Toggle menu');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;

            const headerInner = document.querySelector('.header-inner');
            if (headerInner) {
                headerInner.appendChild(menuButton);
            }

            // Add mobile menu styles
            if (!document.getElementById('mobile-menu-styles')) {
                const style = document.createElement('style');
                style.id = 'mobile-menu-styles';
                style.textContent = `
                    @media (max-width: 767px) {
                        .mobile-menu-toggle {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-around;
                            width: 32px;
                            height: 32px;
                            background: transparent;
                            border: none;
                            cursor: pointer;
                            padding: 0;
                            z-index: 1001;
                        }
                        .hamburger-line {
                            width: 100%;
                            height: 3px;
                            background: var(--color-primary);
                            border-radius: 2px;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
                            transform: rotate(45deg) translate(8px, 8px);
                        }
                        .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
                            opacity: 0;
                        }
                        .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
                            transform: rotate(-45deg) translate(7px, -7px);
                        }
                        .main-navigation {
                            position: fixed;
                            top: 80px;
                            left: 0;
                            right: 0;
                            background: white;
                            transform: translateY(-100%);
                            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                            z-index: 1000;
                        }
                        .main-navigation.active {
                            transform: translateY(0);
                        }
                        .main-navigation ul {
                            flex-direction: column;
                            padding: 2rem;
                            gap: 0;
                        }
                        .main-navigation li {
                            width: 100%;
                            border-bottom: 1px solid var(--color-neutral-200);
                        }
                        .main-navigation li:last-child {
                            border-bottom: none;
                        }
                        .main-navigation a {
                            display: block;
                            padding: 1rem;
                            width: 100%;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            // Toggle menu
            menuButton.addEventListener('click', function() {
                const nav = document.querySelector('.main-navigation');
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                this.setAttribute('aria-expanded', !isExpanded);
                this.classList.toggle('active');
                nav.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                const nav = document.querySelector('.main-navigation');
                const isClickInside = header.contains(e.target);

                if (!isClickInside && nav.classList.contains('active')) {
                    menuButton.classList.remove('active');
                    nav.classList.remove('active');
                    menuButton.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // ========================================================================
    // LAZY LOAD IMAGES
    // ========================================================================

    function initLazyLoad() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // ========================================================================
    // INITIALIZE ALL FEATURES
    // ========================================================================

    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all features
        initHeaderScroll();
        initSmoothScroll();
        initScrollAnimations();
        initCounterAnimations();
        initNavigationActiveState();
        initButtonRipple();
        initParallax();
        initMobileMenu();
        initLazyLoad();

        // Add loaded class to body for CSS transitions
        document.body.classList.add('js-loaded');

        // Performance monitoring
        if (window.performance && window.performance.mark) {
            window.performance.mark('berg-js-loaded');
        }

        console.log('🚀 Berg Projects theme enhanced JavaScript loaded successfully');
    }

    // Start initialization
    init();

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            initMobileMenu();
        }, 250);
    }, { passive: true });

})();
