export function setLock() {
    if (localStorage.getItem('lock') === null) {
        localStorage.setItem('lock', 'true');
    } else {
        localStorage.removeItem('lock');
    }
}