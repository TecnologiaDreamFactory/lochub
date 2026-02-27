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

// Funções do Carrossel (responsivo: 1 item no mobile, 2 no desktop)
let currentPage = 0;
let slides = [];
let totalItems = 0;
let itemsPerView = 1;
let totalPages = 0;
let autoplayTimer;

function getItemsPerView() {
    return window.innerWidth > 768 ? 2 : 1;
}

function setupCarouselVariables() {
    slides = Array.from(document.querySelectorAll('.carousel-item'));
    totalItems = slides.length;
    itemsPerView = getItemsPerView();
    totalPages = Math.max(1, Math.ceil(totalItems / itemsPerView));
}

function buildDots() {
    const dotsContainer = document.getElementById('carouselDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToPage(i);
        dotsContainer.appendChild(dot);
    }
}

function initCarousel() {
    const carousel = document.getElementById('carouselInner');
    const dotsContainer = document.getElementById('carouselDots');
    if (!carousel || !dotsContainer) return;

    setupCarouselVariables();
    currentPage = 0;
    buildDots();
    updateCarousel();
    startAutoplay();

    window.addEventListener('resize', handleCarouselResize);
}

function handleCarouselResize() {
    const oldItemsPerView = itemsPerView;
    const newItemsPerView = getItemsPerView();
    if (oldItemsPerView === newItemsPerView) return;

    setupCarouselVariables();
    currentPage = 0;
    buildDots();
    updateCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('carouselInner');
    if (!carousel) return;

    const offsetPercent = currentPage * 100;
    carousel.style.transform = `translateX(-${offsetPercent}%)`;

    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}

function carouselNext() {
    currentPage = (currentPage + 1) % totalPages;
    updateCarousel();
    resetAutoplay();
}

function carouselPrev() {
    currentPage = (currentPage - 1 + totalPages) % totalPages;
    updateCarousel();
    resetAutoplay();
}

function goToPage(index) {
    currentPage = index;
    updateCarousel();
    resetAutoplay();
}

function startAutoplay() {
    if (totalPages <= 1) return;
    autoplayTimer = setInterval(carouselNext, 5000);
}

function resetAutoplay() {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    startAutoplay();
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

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initMobileMenu();
});
