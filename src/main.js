import './style.css';
import {
    supabase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getComics,
    getComicById,
    getChapterPages,
    saveReadingProgress,
    getUserLibrary
} from './supabase.js';

let currentUser = null;
let currentComic = null;
let currentChapter = null;
let isSignUp = false;

async function initApp() {
    currentUser = await getCurrentUser();
    updateAuthUI();
    loadComics();
    setupEventListeners();
    setupAuthListener();
}

function setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
        (async () => {
            currentUser = session?.user || null;
            updateAuthUI();
            if (event === 'SIGNED_IN') {
                closeAuthModal();
                if (getCurrentPage() === 'library') {
                    loadLibrary();
                }
            }
        })();
    });
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (currentUser) {
        authBtn.textContent = 'Sign Out';
        authBtn.onclick = handleSignOut;
    } else {
        authBtn.textContent = 'Sign In';
        authBtn.onclick = openAuthModal;
    }
}

function setupEventListeners() {
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        navigateToPage('home');
    });

    const authModal = document.getElementById('auth-modal');
    document.querySelector('.close-modal').addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
    document.getElementById('toggle-auth').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
}

function getCurrentPage() {
    const activePage = document.querySelector('.page.active');
    return activePage?.id.replace('-page', '') || 'home';
}

function navigateToPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    if (pageName === 'library') {
        loadLibrary();
    }
}

async function loadComics(searchQuery = '') {
    const grid = document.getElementById('comics-grid');
    grid.innerHTML = '<div class="loading">Loading comics...</div>';

    const { data: comics, error } = await getComics(searchQuery);

    if (error) {
        grid.innerHTML = '<div class="loading">Error loading comics</div>';
        return;
    }

    if (!comics || comics.length === 0) {
        grid.innerHTML = '<div class="loading">No comics found. Add some comics to get started!</div>';
        return;
    }

    grid.innerHTML = '';
    comics.forEach((comic, index) => {
        const card = createComicCard(comic, index);
        grid.appendChild(card);
    });
}

function createComicCard(comic, index) {
    const avgColor = generateAverageColor(comic.title);
    const article = document.createElement('article');
    article.style.setProperty('--avarage-color', avgColor);
    article.style.animationDelay = `${index * 0.05}s`;

    article.innerHTML = `
        <figure>
            <img src="${comic.cover_image || 'https://images.pexels.com/photos/1005012/pexels-photo-1005012.jpeg?auto=compress&cs=tinysrgb&w=400'}"
                 alt="${comic.title}">
            <figcaption>${comic.title}</figcaption>
        </figure>
    `;

    article.addEventListener('click', () => showComicDetail(comic.id));
    return article;
}

function generateAverageColor(title) {
    const colors = ['#b0b6a9', '#afa294', '#3c3c3d', '#b47460', '#60a6ce', '#46666f', '#8e898f', '#8d516e'];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

async function showComicDetail(comicId) {
    const { data: comic, error } = await getComicById(comicId);

    if (error || !comic) {
        alert('Error loading comic details');
        return;
    }

    currentComic = comic;
    const content = document.getElementById('comic-detail-content');
    
    content.innerHTML = `
        <div class="comic-detail">
            <div>
                <img src="${comic.cover_image || 'https://images.pexels.com/photos/1005012/pexels-photo-1005012.jpeg?auto=compress&cs=tinysrgb&w=400'}" 
                     alt="${comic.title}" 
                     class="comic-detail-cover">
            </div>
            <div class="comic-detail-info">
                <h2>${comic.title}</h2>
                <div class="comic-detail-meta">
                    <p><strong>Author:</strong> ${comic.author || 'Unknown'}</p>
                    <p><strong>Status:</strong> ${comic.status || 'Ongoing'}</p>
                    <p><strong>Chapters:</strong> ${comic.chapters?.length || 0}</p>
                </div>
                <div class="comic-description">
                    <p>${comic.description || 'No description available.'}</p>
                </div>
                <div class="chapters-list">
                    <h3>Chapters</h3>
                    <div id="chapters-container"></div>
                </div>
            </div>
        </div>
    `;

    const chaptersContainer = document.getElementById('chapters-container');
    if (comic.chapters && comic.chapters.length > 0) {
        comic.chapters.forEach(chapter => {
            const chapterItem = document.createElement('div');
            chapterItem.className = 'chapter-item';
            chapterItem.innerHTML = `
                <span>Chapter ${chapter.chapter_number}: ${chapter.title}</span>
                <span>${chapter.pages_count || 0} pages</span>
            `;
            chapterItem.addEventListener('click', () => openReader(comic.id, chapter.id));
            chaptersContainer.appendChild(chapterItem);
        });
    } else {
        chaptersContainer.innerHTML = '<p>No chapters available yet.</p>';
    }

    navigateToPage('comic-detail');
}

async function openReader(comicId, chapterId) {
    const { data: pages, error } = await getChapterPages(chapterId);

    if (error || !pages || pages.length === 0) {
        alert('Error loading chapter pages');
        return;
    }

    currentChapter = chapterId;
    const readerContent = document.getElementById('reader-content');
    
    readerContent.innerHTML = `
        <div class="reader-container">
            <div class="reader-header">
                <button class="reader-btn" onclick="closeReader()">← Exit Reader</button>
                <div class="reader-title">${currentComic.title} - Chapter ${pages[0].chapter_id}</div>
                <div class="reader-controls">
                    <select id="page-selector" class="reader-btn">
                        ${pages.map((p, i) => `<option value="${i}">Page ${i + 1}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="reader-pages" id="reader-pages"></div>
            <div class="reader-navigation">
                <button class="reader-btn" id="prev-page-btn">← Previous</button>
                <button class="reader-btn" id="next-page-btn">Next →</button>
            </div>
        </div>
    `;

    const pagesContainer = document.getElementById('reader-pages');
    pages.forEach(page => {
        const img = document.createElement('img');
        img.src = page.image_url || 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=800';
        img.alt = `Page ${page.page_number}`;
        img.className = 'reader-page-img';
        pagesContainer.appendChild(img);
    });

    document.getElementById('page-selector').addEventListener('change', (e) => {
        const pageIndex = parseInt(e.target.value);
        scrollToPage(pageIndex);
    });

    document.getElementById('prev-page-btn').addEventListener('click', () => navigatePage(-1));
    document.getElementById('next-page-btn').addEventListener('click', () => navigatePage(1));

    navigateToPage('reader');

    if (currentUser) {
        await saveReadingProgress(currentUser.id, comicId, chapterId, 1);
    }
}

function scrollToPage(pageIndex) {
    const pages = document.querySelectorAll('.reader-page-img');
    if (pages[pageIndex]) {
        pages[pageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function navigatePage(direction) {
    const selector = document.getElementById('page-selector');
    const currentPage = parseInt(selector.value);
    const newPage = currentPage + direction;
    const maxPage = selector.options.length - 1;

    if (newPage >= 0 && newPage <= maxPage) {
        selector.value = newPage;
        scrollToPage(newPage);
    }
}

window.closeReader = function() {
    navigateToPage('comic-detail');
};

async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    await loadComics(query);
}

async function loadLibrary() {
    const libraryContent = document.getElementById('library-content');
    
    if (!currentUser) {
        libraryContent.innerHTML = '<p>Please sign in to view your library</p>';
        return;
    }

    libraryContent.innerHTML = '<div class="loading">Loading your library...</div>';

    const { data, error } = await getUserLibrary(currentUser.id);

    if (error || !data || data.length === 0) {
        libraryContent.innerHTML = '<p>Your library is empty. Start reading some comics!</p>';
        return;
    }

    libraryContent.innerHTML = '';
    data.forEach((item, index) => {
        if (item.comics) {
            const card = createComicCard(item.comics, index);
            libraryContent.appendChild(card);
        }
    });
}

function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('auth-error').textContent = '';
}

function toggleAuthMode() {
    isSignUp = !isSignUp;
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit');
    const toggleText = document.getElementById('toggle-auth');

    if (isSignUp) {
        title.textContent = 'Sign Up';
        submitBtn.textContent = 'Sign Up';
        toggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-auth">Sign In</a>';
    } else {
        title.textContent = 'Sign In';
        submitBtn.textContent = 'Sign In';
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-auth">Sign Up</a>';
    }

    document.getElementById('toggle-auth').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorDiv = document.getElementById('auth-error');

    errorDiv.textContent = '';

    let result;
    if (isSignUp) {
        result = await signUp(email, password);
    } else {
        result = await signIn(email, password);
    }

    if (result.error) {
        errorDiv.textContent = result.error.message;
    } else {
        currentUser = result.data.user;
        updateAuthUI();
        closeAuthModal();
    }
}

async function handleSignOut() {
    await signOut();
    currentUser = null;
    updateAuthUI();
    navigateToPage('home');
}

initApp();
