const darkBtn = document.querySelector('.darkMode');
const darkText = document.getElementById("darkModetxt");

// Event Listener
darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-active');
    
    // Aktuellen Zustand nach toggle prüfen
    const isDark = document.body.classList.contains('dark-active');
    
    // Text setzen
    darkText.textContent = isDark ? "White Mode" : "Dark Mode";

    // Zustand speichern
    localStorage.setItem('darkmode', isDark);
});

if (localStorage.getItem('darkmode') === 'true') {
    document.body.classList.add('dark-active');
    darkText.textContent = "White Mode";
} else {
    darkText.textContent = "Dark Mode";
}
