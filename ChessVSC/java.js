const darkBtn = document.querySelector('.darkMode');

darkBtn.addEventListener('click', () => {
    
    document.body.classList.toggle('dark-active');
    if (localStorage.getItem('darkmode') === 'true')
    {
        document.getElementById("darkModetxt").textContent = "Dark Mode";
    } else 
    {
        document.getElementById("darkModetxt").textContent = "White Mode";
    }
    const isDark = document.body.classList.contains('dark-active');
    localStorage.setItem('darkmode', isDark);
});

if (localStorage.getItem('darkmode') === 'true') {
    document.body.classList.add('dark-active');
}
