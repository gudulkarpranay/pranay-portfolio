document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Cursor Glow Effect with Magnetic LERP (Linear Interpolation)
    const glow = document.getElementById('cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    
    // Only run cursor glow on devices with pointer/mouse support
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice && glow) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animateGlow = () => {
            // Easing factor (lower means more delay/smoothing)
            const ease = 0.08;
            
            glowX += (mouseX - glowX) * ease;
            glowY += (mouseY - glowY) * ease;
            
            // Subtract 250 because the cursor glow width & height is 500px (centered)
            glow.style.transform = `translate(${glowX - 250}px, ${glowY - 250}px)`;
            
            requestAnimationFrame(animateGlow);
        };
        
        // Start animation loop
        animateGlow();
    } else if (glow) {
        // Hide glow element on touch devices to save performance
        glow.style.display = 'none';
    }

    // 3. Header Scroll Styling
    const header = document.getElementById('header');
    
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Run initially in case page loads scrolled down

    // 4. Scroll Reveal Animation (Intersection Observer)
    const fadeSections = document.querySelectorAll('.section-hidden');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    observer.unobserve(entry.target); // Stop observing once displayed
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        fadeSections.forEach(section => {
            revealObserver.observe(section);
        });
    } else {
        // Fallback for older browsers
        fadeSections.forEach(section => {
            section.classList.add('section-visible');
        });
    }

    // 5. Mobile Navigation Drawer
    const mobileToggle = document.getElementById('mobile-toggle');
    const closeDrawer = document.getElementById('close-drawer');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-links a');

    if (mobileToggle && mobileDrawer && closeDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });

        const closeMenu = () => {
            mobileDrawer.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        };

        closeDrawer.addEventListener('click', closeMenu);

        drawerLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // 6. Active Navigation Highlighting on Scroll
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    const updateActiveNav = () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Buffer to activate slightly before the section reaches top
            if (scrollPosition >= sectionTop - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Run initially

    // 7. Web3Forms Integration & Feedback
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && submitBtn && formFeedback) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Set loading state on button
            const btnSpan = submitBtn.querySelector('span');
            const originalText = btnSpan.textContent;
            btnSpan.textContent = 'Sending Message...';
            submitBtn.disabled = true;
            formFeedback.textContent = '';
            formFeedback.className = 'form-feedback';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.status === 200 && data.success) {
                    // On successful submission show success message instead of the form
                    contactForm.innerHTML = `
                        <div class="form-success-message" style="text-align: center; padding: 2.5rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;">
                            <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--accent-cyan);"></i>
                            <p style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 600; line-height: 1.5; color: var(--text-primary);">
                                Thanks for reaching out! I'll get back to you within 24 hours 🙌
                            </p>
                        </div>
                    `;
                    // Re-initialize Lucide to render the check-circle icon
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    // API reported error
                    formFeedback.textContent = 'Something went wrong. Please WhatsApp me directly.';
                    formFeedback.className = 'form-feedback error';
                    btnSpan.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                // Network error
                formFeedback.textContent = 'Something went wrong. Please WhatsApp me directly.';
                formFeedback.className = 'form-feedback error';
                btnSpan.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
