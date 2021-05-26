$(function () {
    // init feather icons
    feather.replace();
});

// Conditional navbar
const logginLinks = document.querySelectorAll('.logged-in');
const loggoutLinks = document.querySelectorAll('.logged-out');
const test = document.querySelectorAll('.test');
const hide = document.querySelectorAll('.hide');
const setupUI = (user) => {
    if(user){
        logginLinks.forEach(item => item.style.display = 'block');
        loggoutLinks.forEach(item => item.style.display = 'block');
        test.forEach(item => item.style.display = 'none');
        hide.forEach(item => item.style.display = 'none');
    }
    else{
        logginLinks.forEach(item => item.style.display = 'none');
        loggoutLinks.forEach(item => item.style.display = 'block');
        test.forEach(item => item.style.display = 'none');
        hide.forEach(item => item.style.display = 'block');
    }
}