console.log("teste");
const page = document.getElementById('home');
function navigate(page) {
    if (document.getElementById(page).classList.contains('active'))
        return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    history.pushState(null, '', `#${page}`);
}
window.addEventListener('popstate', () => {
    const page = location.hash.replace('#', '') || 'home';
    navigate(page);
});
window.addEventListener('load', () => {
    const page = location.hash.replace('#', '') || 'home';
    navigate(page);
});
