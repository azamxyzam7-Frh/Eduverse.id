const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const cards = [...document.querySelectorAll('.article-card')];
const noResults = document.getElementById('noResults');

let activeFilter = 'all';

// Menu mobile
menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// Dark mode
const savedTheme = localStorage.getItem('eduverse-theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☾';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    const dark = document.body.classList.contains('dark');

    themeToggle.textContent = dark ? '☾' : '☼';

    localStorage.setItem(
        'eduverse-theme',
        dark ?
