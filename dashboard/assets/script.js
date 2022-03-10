function darkModeToggle() {
    document.documentElement.classList.toggle("dark");
    if (localStorage.getItem("isDarkMode") === "true") {
        localStorage.setItem("isDarkMode", "false");
    } else {
        localStorage.setItem("isDarkMode", "true");
    }
}