/**
 * FECASAM 2026 - Main JavaScript
 * Diseño Moderno, Profesional y 100% Responsive
 * Optimizado para todos los navegadores y dispositivos
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    API_ENDPOINT: 'api/submit-registration.php',
    COMPLAINTS_ENDPOINT: 'api/submit-complaint.php',
    SCROLL_OFFSET: 80,
    ANIMATION_DURATION: 300,
    MOBILE_BREAKPOINT: 1024,
    TABLET_BREAKPOINT: 768,
};

// ============================================
// STATE MANAGEMENT
// ============================================
const STATE = {
    isMobileMenuOpen: false,
    isScrolled: false,
    currentSection: 'inicio',
    hasUserScrolled: false,
};

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    header: null,
    navToggle: null,
    navMenu: null,
    navLinks: null,
    scrollTop: null,
    registrationForm: null,
    registrationSuccess: null,
    modalContainer: null,
    modalClose: null,
    modalBody: null,
    // heroVideo: null, // Replaced by carousel
};

// Initialize DOM elements when DOM is ready
function initDOMElements() {
    DOM.header = document.getElementById('header');
    DOM.navToggle = document.getElementById('navToggle');
    DOM.navMenu = document.getElementById('navMenu');
    DOM.navLinks = document.querySelectorAll('.nav-link');
    DOM.scrollTop = document.getElementById('scrollTop');
    DOM.registrationForm = document.getElementById('registrationForm');
    DOM.registrationSuccess = document.getElementById('registrationSuccess');
    DOM.modalContainer = document.getElementById('modalContainer');
    DOM.modalClose = document.getElementById('modalClose');
    DOM.modalBody = document.getElementById('modalBody');
    // DOM.heroVideo = document.querySelector('.hero-video'); // Replaced by carousel
}

// ============================================
// UTILITY FUNCTIONS - Modern & Optimized
// ============================================

/**
 * Debounce function to limit execution rate
 */
const debounce = (func, wait = 10) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function for scroll events
 */
const throttle = (func, wait = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
};

/**
 * Smooth scroll to element with offset
 */
function smoothScroll(target, offset = CONFIG.SCROLL_OFFSET) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Generate random registration code
 */
function generateRegistrationCode() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FECA-${year}-${random}`;
}

/**
 * Format phone number (remove non-digits)
 */
function formatPhone(phone) {
    return phone.replace(/\D/g, '');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate DNI (8 digits)
 */
function isValidDNI(dni) {
    return /^\d{8}$/.test(dni);
}

/**
 * Validate RUC (11 digits)
 */
function isValidRUC(ruc) {
    return /^\d{11}$/.test(ruc);
}

/**
 * Check if device is mobile
 */
function isMobileDevice() {
    return window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
}

/**
 * Check if device is tablet
 */
function isTabletDevice() {
    return window.innerWidth >= CONFIG.TABLET_BREAKPOINT && window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
}

/**
 * Get current viewport dimensions
 */
function getViewport() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

/**
 * Show toast notification with auto-dismiss
 */
function showToast(message, type = 'success', duration = 3500) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles if not already present
    if (!document.querySelector('style[data-toast]')) {
        const style = document.createElement('style');
        style.setAttribute('data-toast', 'true');
        style.textContent = `
            .toast {
                position: fixed;
                top: ${isMobileDevice() ? '80px' : '100px'};
                right: ${isMobileDevice() ? '1rem' : '2rem'};
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 0.875rem;
                z-index: 10000;
                animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                max-width: ${isMobileDevice() ? 'calc(100% - 2rem)' : '400px'};
                font-size: ${isMobileDevice() ? '0.9rem' : '1rem'};
            }
            .toast-success { border-left: 4px solid #22c55e; }
            .toast-success i { color: #22c55e; font-size: 1.5rem; }
            .toast-error { border-left: 4px solid #ef4444; }
            .toast-error i { color: #ef4444; font-size: 1.5rem; }
            @keyframes slideInRight {
                from { 
                    transform: translateX(400px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            @keyframes slideOutRight {
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateX(400px); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto dismiss with animation
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
}

// ============================================
// HEADER SCROLL EFFECT - Optimized
// ============================================
const handleScroll = throttle(() => {
    const scrolled = window.pageYOffset > 100;
    
    // Update header state
    if (scrolled !== STATE.isScrolled) {
        STATE.isScrolled = scrolled;
        
        if (DOM.header) {
            DOM.header.classList.toggle('scrolled', scrolled);
        }
        
        if (DOM.scrollTop) {
            DOM.scrollTop.classList.toggle('visible', scrolled);
        }
    }
    
    // Update active nav link
    updateActiveNavLink();
    
    // Mark that user has scrolled
    if (!STATE.hasUserScrolled && window.pageYOffset > 50) {
        STATE.hasUserScrolled = true;
    }
}, 100);

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    if (!DOM.navLinks || DOM.navLinks.length === 0) return;
    
    const sections = document.querySelectorAll('.section[id], .hero[id]');
    const scrollPos = window.pageYOffset + CONFIG.SCROLL_OFFSET + 150;
    
    let currentSectionId = null;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < bottom) {
            currentSectionId = id;
        }
    });
    
    if (currentSectionId && currentSectionId !== STATE.currentSection) {
        STATE.currentSection = currentSectionId;
        
        DOM.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${currentSectionId}`);
        });
    }
}

// ============================================
// MOBILE NAVIGATION - Enhanced
// ============================================
function toggleMobileNav() {
    STATE.isMobileMenuOpen = !STATE.isMobileMenuOpen;
    
    if (DOM.navMenu) {
        DOM.navMenu.classList.toggle('active', STATE.isMobileMenuOpen);
    }
    
    if (DOM.navToggle) {
        DOM.navToggle.classList.toggle('active', STATE.isMobileMenuOpen);
    }
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = STATE.isMobileMenuOpen ? 'hidden' : '';
}

function closeMobileNav() {
    if (!STATE.isMobileMenuOpen) return;
    
    STATE.isMobileMenuOpen = false;
    
    if (DOM.navMenu) {
        DOM.navMenu.classList.remove('active');
    }
    
    if (DOM.navToggle) {
        DOM.navToggle.classList.remove('active');
    }
    
    document.body.style.overflow = '';
}

// Close mobile nav when clicking outside
function handleClickOutside(e) {
    if (!STATE.isMobileMenuOpen) return;
    if (!isMobileDevice()) return;
    
    const isNavClick = DOM.navMenu?.contains(e.target) || DOM.navToggle?.contains(e.target);
    
    if (!isNavClick) {
        closeMobileNav();
    }
}

// Close mobile nav on escape key
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeMobileNav();
    }
}

// Handle window resize
const handleResize = debounce(() => {
    // Close mobile menu if switching to desktop
    if (!isMobileDevice() && STATE.isMobileMenuOpen) {
        closeMobileNav();
    }
}, 250);

// ============================================
// NAVIGATION LINKS - Enhanced Functionality
// ============================================
function initNavigation() {
    if (!DOM.navLinks) return;
    
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Handle internal links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScroll(targetElement);
                    closeMobileNav();
                    
                    // Update URL without page reload
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            }
        });
    });
    
    // Mobile toggle
    if (DOM.navToggle) {
        DOM.navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }
    
    // Scroll to top
    if (DOM.scrollTop) {
        DOM.scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// FORM VALIDATION & SUBMISSION - Enhanced
// ============================================

/**
 * Validate registration form with detailed error checking
 */
function validateRegistrationForm(formData) {
    const errors = [];
    
    // Full name validation
    const fullName = formData.get('fullName')?.trim();
    if (!fullName || fullName.length < 3) {
        errors.push('El nombre completo debe tener al menos 3 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fullName)) {
        errors.push('El nombre solo debe contener letras');
    }
    
    // Document validation
    const docType = formData.get('documentType');
    const docNumber = formData.get('documentNumber')?.trim();
    
    if (!docType) {
        errors.push('Debe seleccionar un tipo de documento');
    }
    
    if (!docNumber) {
        errors.push('Debe ingresar un número de documento');
    } else {
        if (docType === 'dni' && !isValidDNI(docNumber)) {
            errors.push('El DNI debe tener exactamente 8 dígitos');
        }
        
        if (docType === 'ruc' && !isValidRUC(docNumber)) {
            errors.push('El RUC debe tener exactamente 11 dígitos');
        }
        
        if (docType === 'ce' && (docNumber.length < 9 || docNumber.length > 12)) {
            errors.push('El Carné de Extranjería debe tener entre 9 y 12 caracteres');
        }
    }
    
    // Email validation
    const email = formData.get('email')?.trim();
    if (!email) {
        errors.push('Debe ingresar un correo electrónico');
    } else if (!isValidEmail(email)) {
        errors.push('Ingrese un correo electrónico válido');
    }
    
    // Phone validation
    const phone = formatPhone(formData.get('phone') || '');
    if (phone.length < 9) {
        errors.push('Ingrese un teléfono válido (mínimo 9 dígitos)');
    }
    
    // Origin validation
    const origin = formData.get('origin')?.trim();
    if (!origin || origin.length < 3) {
        errors.push('Ingrese su procedencia (mínimo 3 caracteres)');
    }
    
    // Category validation
    if (!formData.get('category')) {
        errors.push('Seleccione una categoría de participación');
    }
    
    // Terms acceptance
    if (!formData.get('terms')) {
        errors.push('Debe aceptar los términos y condiciones');
    }
    
    return errors;
}

/**
 * Submit registration form with error handling
 */
async function submitRegistration(formData) {
    try {
        // In production, send to API
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Fallback: Simulate success for demo purposes
        // Remove this section in production
        console.warn('Using demo mode - API endpoint not available');
        return {
            success: true,
            data: {
                code: generateRegistrationCode(),
                email: formData.get('email'),
                fullName: formData.get('fullName')
            }
        };
    }
}

/**
 * Handle registration form submission
 */
function initRegistrationForm() {
    if (!DOM.registrationForm) return;
    
    DOM.registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(DOM.registrationForm);
        
        // Validate form
        const errors = validateRegistrationForm(formData);
        
        if (errors.length > 0) {
            showToast(errors[0], 'error', 4000);
            // Highlight first error field
            const firstErrorField = DOM.registrationForm.querySelector('[name]:invalid');
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Show loading state
        const submitBtn = DOM.registrationForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        submitBtn.style.cursor = 'wait';
        
        try {
            const result = await submitRegistration(formData);
            
            if (result.success) {
                // Hide form, show success message
                DOM.registrationForm.style.display = 'none';
                DOM.registrationSuccess.style.display = 'block';
                
                // Set registration code
                const codeElement = document.getElementById('registrationCode');
                if (codeElement) {
                    codeElement.textContent = result.data.code || generateRegistrationCode();
                }
                
                // Show success toast
                showToast('¡Registro completado exitosamente! Revisa tu correo.', 'success', 5000);
                
                // Log for backend (email confirmation)
                console.log('Registration successful:', {
                    email: result.data.email,
                    name: result.data.fullName,
                    code: result.data.code
                });
                
                // Scroll to success message
                setTimeout(() => {
                    DOM.registrationSuccess.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 400);
                
                // Analytics tracking (if available)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'engagement',
                        'event_label': 'registration_form'
                    });
                }
            } else {
                throw new Error('Registration failed');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Error al enviar el formulario. Por favor, inténtelo nuevamente.', 'error', 5000);
            
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.cursor = 'pointer';
        }
    });
    
    // Handle new registration button
    const newRegBtn = document.getElementById('newRegistration');
    if (newRegBtn) {
        newRegBtn.addEventListener('click', () => {
            DOM.registrationForm.reset();
            DOM.registrationForm.style.display = 'block';
            DOM.registrationSuccess.style.display = 'none';
            
            // Scroll to form
            setTimeout(() => {
                DOM.registrationForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        });
    }
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

/**
 * Open modal with content
 */
function openModal(content) {
    if (!DOM.modalContainer || !DOM.modalBody) return;
    
    DOM.modalBody.innerHTML = content;
    DOM.modalContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
    if (!DOM.modalContainer) return;
    
    DOM.modalContainer.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Get modal content based on type
 */
function getModalContent(type) {
    const contents = {
        terms: `
            <h2>Términos y Condiciones - FECASAM 2026</h2>
            <p><strong>Última actualización:</strong> Enero 2026</p>
            
            <h3>1. Aceptación de los Términos</h3>
            <p>Al registrarse en FECASAM 2026, usted acepta cumplir con estos términos y condiciones.</p>
            
            <h3>2. Registro de Participantes</h3>
            <p>Los participantes deben proporcionar información veraz y actualizada. Nos reservamos el derecho de rechazar o cancelar registros que contengan información falsa.</p>
            
            <h3>3. Categorías de Participación</h3>
            <p>Cada categoría tiene requisitos específicos detallados en las bases del concurso. Los expositores deben cumplir con los estándares de calidad y sanidad establecidos.</p>
            
            <h3>4. Responsabilidad</h3>
            <p>FECASAM 2026 no se hace responsable por pérdidas, daños o robos de artículos personales o animales durante el evento.</p>
            
            <h3>5. Derechos de Imagen</h3>
            <p>Los participantes autorizan el uso de fotografías y videos tomados durante el evento para fines promocionales.</p>
            
            <h3>6. Cancelaciones</h3>
            <p>Las cancelaciones deben notificarse con al menos 15 días de anticipación. No se realizarán reembolsos después de esta fecha.</p>
        `,
        
        privacy: `
            <h2>Política de Privacidad</h2>
            <p><strong>Conforme a la Ley N° 29733 - Ley de Protección de Datos Personales</strong></p>
            
            <h3>1. Recopilación de Datos</h3>
            <p>Recopilamos datos personales necesarios para la gestión de inscripciones y comunicaciones del evento: nombre, documento, correo, teléfono y procedencia.</p>
            
            <h3>2. Uso de la Información</h3>
            <p>Sus datos serán utilizados exclusivamente para:</p>
            <ul>
                <li>Gestionar su inscripción en FECASAM 2026</li>
                <li>Enviar comunicaciones relacionadas al evento</li>
                <li>Elaborar estadísticas internas (de forma anónima)</li>
                <li>Cumplir con obligaciones legales</li>
            </ul>
            
            <h3>3. Protección de Datos</h3>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra accesos no autorizados.</p>
            
            <h3>4. Derechos del Titular</h3>
            <p>Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales contactando a info@fecasam2026.com</p>
            
            <h3>5. Compartir Información</h3>
            <p>No compartimos sus datos con terceros sin su consentimiento, excepto cuando sea requerido por ley.</p>
        `,
        
        cookies: `
            <h2>Política de Cookies</h2>
            
            <h3>¿Qué son las cookies?</h3>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.</p>
            
            <h3>Cookies que utilizamos</h3>
            <ul>
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio.</li>
                <li><strong>Cookies de preferencias:</strong> Recuerdan sus configuraciones personales.</li>
                <li><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo los visitantes usan el sitio.</li>
            </ul>
            
            <h3>Control de Cookies</h3>
            <p>Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.</p>
        `
    };
    
    return contents[type] || '<p>Contenido no disponible</p>';
}

/**
 * Initialize modal functionality
 */
function initModals() {
    // Close modal on button click
    if (DOM.modalClose) {
        DOM.modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal on overlay click
    if (DOM.modalContainer) {
        DOM.modalContainer.addEventListener('click', (e) => {
            if (e.target === DOM.modalContainer) {
                closeModal();
            }
        });
    }
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.modalContainer?.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Handle modal triggers
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalType = trigger.getAttribute('data-modal');
            const content = getModalContent(modalType);
            openModal(content);
        });
    });
}

// ============================================
// SCROLL ANIMATIONS - Intersection Observer
// ============================================

/**
 * Observe elements for scroll animations
 */
function initScrollAnimations() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer not supported');
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation delay for multiple elements
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, index * 50);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll(`
        .stat-card,
        .feature-card,
        .timeline-item,
        .resource-card,
        .contact-card,
        .form-group
    `);
    
    animatedElements.forEach(el => {
        // Add initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// ============================================
// HERO CAROUSEL
// ============================================

/**
 * Initialize hero background carousel with automatic rotation
 */
function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides || slides.length === 0) return;
    
    let currentSlide = 0;
    const slideInterval = 5000; // Change slide every 5 seconds
    
    function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        slides[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Auto-rotate carousel
    setInterval(nextSlide, slideInterval);
    
    // Preload images for smooth transitions
    slides.forEach(slide => {
        const img = new Image();
        const bgUrl = slide.style.backgroundImage.slice(5, -2);
        img.src = bgUrl;
    });
    
    console.log(`Hero carousel initialized with ${slides.length} slides`);
}

// ============================================
// HERO VIDEO OPTIMIZATION
// ============================================

/**
 * Pause video when not in viewport to save resources
 */
function initVideoOptimization() {
    if (!DOM.heroVideo) return;
    
    // Check if video is supported
    if (DOM.heroVideo.canPlayType) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    DOM.heroVideo.play().catch(e => {
                        console.log('Video autoplay prevented:', e.message);
                    });
                } else {
                    DOM.heroVideo.pause();
                }
            });
        }, { threshold: 0.25 });
        
        observer.observe(DOM.heroVideo);
        
        // Pause video on mobile to save bandwidth
        if (isMobileDevice()) {
            DOM.heroVideo.pause();
            DOM.heroVideo.poster = 'assets/images/hero-poster.jpg';
        }
    }
}

// ============================================
// FORM INPUT ENHANCEMENTS
// ============================================

/**
 * Auto-format phone number as user types
 */
function initPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', debounce((e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Auto-add Peru country code
        if (value.length > 0 && !value.startsWith('51')) {
            if (value.length === 9) {
                value = '51' + value;
            }
        }
        
        // Format: +51 XXX XXX XXX
        if (value.startsWith('51')) {
            let formatted = '+51';
            if (value.length > 2) {
                formatted += ' ' + value.substr(2, 3);
            }
            if (value.length > 5) {
                formatted += ' ' + value.substr(5, 3);
            }
            if (value.length > 8) {
                formatted += ' ' + value.substr(8, 3);
            }
            e.target.value = formatted;
        } else {
            e.target.value = value ? '+51 ' + value : '';
        }
    }, 300));
}

/**
 * Dynamic document number validation
 */
function initDocumentValidation() {
    const docType = document.getElementById('documentType');
    const docNumber = document.getElementById('documentNumber');
    
    if (!docType || !docNumber) return;
    
    docType.addEventListener('change', (e) => {
        const type = e.target.value;
        docNumber.value = '';
        
        // Update placeholder and constraints based on document type
        switch(type) {
            case 'dni':
                docNumber.setAttribute('maxlength', '8');
                docNumber.setAttribute('pattern', '[0-9]{8}');
                docNumber.setAttribute('placeholder', '12345678');
                docNumber.setAttribute('inputmode', 'numeric');
                break;
            case 'ruc':
                docNumber.setAttribute('maxlength', '11');
                docNumber.setAttribute('pattern', '[0-9]{11}');
                docNumber.setAttribute('placeholder', '12345678901');
                docNumber.setAttribute('inputmode', 'numeric');
                break;
            case 'ce':
                docNumber.setAttribute('maxlength', '12');
                docNumber.removeAttribute('pattern');
                docNumber.setAttribute('placeholder', 'C001234567');
                docNumber.setAttribute('inputmode', 'text');
                break;
            case 'passport':
                docNumber.setAttribute('maxlength', '12');
                docNumber.removeAttribute('pattern');
                docNumber.setAttribute('placeholder', 'ABC123456');
                docNumber.setAttribute('inputmode', 'text');
                break;
            default:
                docNumber.removeAttribute('maxlength');
                docNumber.removeAttribute('pattern');
                docNumber.setAttribute('placeholder', 'Número de documento');
        }
    });
    
    // Only allow numbers for DNI and RUC
    docNumber.addEventListener('input', debounce((e) => {
        const type = docType.value;
        if (type === 'dni' || type === 'ruc') {
            e.target.value = e.target.value.replace(/\D/g, '');
        }
    }, 100));
    
    // Real-time validation feedback
    docNumber.addEventListener('blur', () => {
        const type = docType.value;
        const value = docNumber.value;
        
        if (value) {
            let isValid = false;
            
            if (type === 'dni') {
                isValid = isValidDNI(value);
            } else if (type === 'ruc') {
                isValid = isValidRUC(value);
            } else {
                isValid = value.length >= 5;
            }
            
            docNumber.style.borderColor = isValid ? '#22c55e' : '#ef4444';
        }
    });
}

/**
 * Add focus indicators to form inputs
 */
function initFormFocusIndicators() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        input.addEventListener('focus', () => {
            formGroup?.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            formGroup?.classList.remove('focused');
        });
    });
}

// ============================================
// SCROLL INDICATOR (Hide on scroll)
// ============================================
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    // Hide indicator after user scrolls
    const hideIndicator = () => {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
    };
    
    let hasScrolled = false;
    window.addEventListener('scroll', () => {
        if (!hasScrolled && window.pageYOffset > 100) {
            hasScrolled = true;
            hideIndicator();
        }
    }, { passive: true });
    
    // Also hide on click
    scrollIndicator.addEventListener('click', () => {
        smoothScroll('#evento');
        hideIndicator();
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================
function monitorPerformance() {
    if ('performance' in window && 'measure' in performance) {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Performance Metrics:', {
                    'DOM Load': `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
                    'Page Load': `${perfData.loadEventEnd - perfData.loadEventStart}ms`,
                    'Total Load Time': `${perfData.loadEventEnd - perfData.fetchStart}ms`
                });
            }
        }, 0);
    }
}

// ============================================
// INITIALIZE APP - Modern Approach
// ============================================

/**
 * Main initialization function
 */
async function init() {
    try {
        // Initialize DOM elements first
        initDOMElements();
        
        // Core functionality
        initNavigation();
        initRegistrationForm();
        initModals();
        
        // Scroll effects
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        handleScroll(); // Initial check
        
        // Close mobile menu on click outside
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Form enhancements
        initPhoneFormatting();
        initDocumentValidation();
        initFormFocusIndicators();
        
        // Animations and visual enhancements
        initScrollAnimations();
        initHeroCarousel();
        initScrollIndicator();
        
        // Performance monitoring (development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            monitorPerformance();
        }
        
        // Log successful initialization
        console.log('%c🎉 FECASAM 2026 - Initialized Successfully!', 'color: #8B5E3C; font-size: 16px; font-weight: bold;');
        console.log('%cVersion: 2.0.0 | Responsive Design', 'color: #D4A574; font-size: 12px;');
        console.log('%cViewport:', 'color: #666;', getViewport());
        console.log('%cDevice Type:', 'color: #666;', isMobileDevice() ? 'Mobile' : isTabletDevice() ? 'Tablet' : 'Desktop');
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// ============================================
// START APPLICATION
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// ============================================
// SERVICE WORKER REGISTRATION (PWA Support)
// ============================================

if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(registration => {
                console.log('✓ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('✗ Service Worker registration failed:', error);
            });
    });
}

// ============================================
// EXPORT FOR TESTING (Development/Testing)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        smoothScroll,
        isValidEmail,
        isValidDNI,
        isValidRUC,
        generateRegistrationCode,
        isMobileDevice,
        isTabletDevice
    };
}

// End of main.js
// ============================================
