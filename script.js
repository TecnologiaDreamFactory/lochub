// Funções do Modal
function openModal(imageSrc, altText) {
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');

    modalImage.src = imageSrc;
    modalImage.alt = altText;

    // centraliza o overlay em toda a tela
    modal.style.display = 'flex';

    // força reflow para reiniciar a animação de zoom
    void modal.offsetWidth;
}

function closeModal() {
    const modal = document.getElementById('photoModal');
    modal.style.display = 'none';
}

// Fechar modal ao clicar fora da imagem
window.onclick = function(event) {
    const modal = document.getElementById('photoModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Funções do Carrossel (responsivo: 1 item no mobile, 2 no desktop) – suporta múltiplos carrosséis
const carouselState = {};

function getItemsPerView() {
    return window.innerWidth > 768 ? 2 : 1;
}

function getCarouselIds(key) {
    return key === 'main'
        ? { inner: 'carouselInner', dots: 'carouselDots' }
        : { inner: 'carouselSolucoesInner', dots: 'carouselSolucoesDots' };
}

function setupCarouselVariables(key) {
    const ids = getCarouselIds(key);
    const inner = document.getElementById(ids.inner);
    if (!inner) return;
    const slides = Array.from(inner.querySelectorAll('.carousel-item'));
    const itemsPerView = getItemsPerView();
    const totalPages = Math.max(1, Math.ceil(slides.length / itemsPerView));
    carouselState[key] = {
        currentPage: 0,
        totalPages,
        totalItems: slides.length,
        itemsPerView,
        autoplayTimer: null
    };
}

function buildDots(key) {
    const state = carouselState[key];
    const ids = getCarouselIds(key);
    const dotsContainer = document.getElementById(ids.dots);
    if (!dotsContainer || !state) return;

    dotsContainer.innerHTML = '';
    for (let i = 0; i < state.totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToPage(i, key);
        dotsContainer.appendChild(dot);
    }
}

function updateCarousel(key) {
    const state = carouselState[key];
    const ids = getCarouselIds(key);
    const carousel = document.getElementById(ids.inner);
    const dotsContainer = document.getElementById(ids.dots);
    if (!carousel || !state || !dotsContainer) return;
    const wrapper = carousel.closest('.carousel');
    if (!wrapper) return;

    const offsetPx = state.currentPage * wrapper.clientWidth;
    carousel.style.transform = `translate3d(-${offsetPx}px, 0, 0)`;

    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentPage);
    });
}

function carouselNext(key) {
    const state = carouselState[key];
    if (!state) return;
    state.currentPage = (state.currentPage + 1) % state.totalPages;
    updateCarousel(key);
    resetAutoplay(key);
}

function carouselPrev(key) {
    const state = carouselState[key];
    if (!state) return;
    state.currentPage = (state.currentPage - 1 + state.totalPages) % state.totalPages;
    updateCarousel(key);
    resetAutoplay(key);
}

function goToPage(index, key) {
    const state = carouselState[key];
    if (!state) return;
    state.currentPage = index;
    updateCarousel(key);
    resetAutoplay(key);
}

function startAutoplay(key) {
    const state = carouselState[key];
    if (!state || state.totalPages <= 1) return;
    state.autoplayTimer = setInterval(() => carouselNext(key), 5000);
}

function resetAutoplay(key) {
    const state = carouselState[key];
    if (!state || !state.autoplayTimer) return;
    clearInterval(state.autoplayTimer);
    startAutoplay(key);
}

function setupCarouselTouch(key) {
    const ids = getCarouselIds(key);
    const inner = document.getElementById(ids.inner);
    if (!inner) return;
    const wrapper = inner.closest('.carousel');
    if (!wrapper) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalDrag = null;

    wrapper.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isHorizontalDrag = null;
        inner.style.transition = 'none';
    }, { passive: true });

    wrapper.addEventListener('touchmove', function (e) {
        if (e.touches.length !== 1) return;
        const state = carouselState[key];
        if (!state) return;
        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const deltaX = curX - touchStartX;
        const deltaY = curY - touchStartY;

        if (isHorizontalDrag === null) {
            isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY);
        }
        if (isHorizontalDrag) {
            e.preventDefault();
            const baseOffset = state.currentPage * wrapper.clientWidth;
            inner.style.transform = `translate3d(${deltaX - baseOffset}px, 0, 0)`;
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', function (e) {
        const state = carouselState[key];
        if (!state) return;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        const threshold = 50;
        inner.style.transition = '';

        if (deltaX < -threshold && state.currentPage < state.totalPages - 1) {
            carouselNext(key);
        } else if (deltaX > threshold && state.currentPage > 0) {
            carouselPrev(key);
        } else {
            updateCarousel(key);
        }
    }, { passive: true });
}

function initCarouselForKey(key) {
    const ids = getCarouselIds(key);
    const carousel = document.getElementById(ids.inner);
    const dotsContainer = document.getElementById(ids.dots);
    if (!carousel || !dotsContainer) return;

    setupCarouselVariables(key);
    carouselState[key].currentPage = 0;
    buildDots(key);
    updateCarousel(key);
    startAutoplay(key);
    setupCarouselTouch(key);
}

function handleCarouselResize() {
    const keys = ['main', 'solucoes'];
    keys.forEach(key => {
        if (!carouselState[key]) return;
        const oldItemsPerView = carouselState[key].itemsPerView;
        const newItemsPerView = getItemsPerView();
        if (oldItemsPerView === newItemsPerView) return;
        if (carouselState[key].autoplayTimer) clearInterval(carouselState[key].autoplayTimer);
        setupCarouselVariables(key);
        carouselState[key].currentPage = 0;
        buildDots(key);
        updateCarousel(key);
        startAutoplay(key);
    });
}

function initCarousel() {
    initCarouselForKey('main');
    initCarouselForKey('solucoes');
    window.addEventListener('resize', handleCarouselResize);
}

// Menu hambúrguer (mobile)
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const header = document.querySelector('header');
    const getHeaderHeight = () => header ? header.offsetHeight : 0;

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            e.preventDefault();

            const id = href.slice(1);
            const target = document.getElementById(id);

            if (nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }

            if (target) {
                setTimeout(() => {
                    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
                    window.scrollTo({ top, behavior: 'smooth' });
                    history.pushState(null, '', href);
                }, 400);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initMobileMenu();
});
