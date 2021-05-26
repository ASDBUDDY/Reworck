const navHome = document.querySelector('.topnav-home');
// listen for auth status changes
auth.onAuthStateChanged(user => {
    if(user) {
        console.log('user is logged in: ',user);
        if(navHome){
        setupUI(user);
    }
    } else {
        console.log('user is logged out');
        if(navHome){
            setupUI();
        }
    }
})



// signup
const signupForm = document.querySelector('[signup-form]')
if(signupForm){
signupForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const checkPassword = signupForm['signup-check-password'].value;

    // signup user
    if(password === checkPassword){
    auth.createUserWithEmailAndPassword(email,password).then(cred => {
        // reset and redirect
        signupForm.reset();
        signupForm.querySelector('[sign-up-error]').innerHTML = '';
        
       /* db.collection('userCred').add({
            username: userName,
            userID: cred.user.uid
        })*/
    window.location.href = "../index.html";
    }).catch(err => {
        signupForm.querySelector('[sign-up-error]').innerHTML = err.message;
    })
}
else{
    signupForm.querySelector('[sign-up-error]').innerHTML = 'The passwords don\'t match';
}
})
}

// logout
const logout =  document.querySelector('[logout]');
if(logout){ 
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        console.log('user logged out');
        window.location.replace("../landingPage.html");
    });
})
}

// login
const loginForm = document.querySelector('[login-form]');
if(loginForm){
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // get user info
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(email,password).then(cred => {
            console.log(cred.user);

            //reset annd redirect
            loginForm.reset();
            loginForm.querySelector('[login-up-error]').innerHTML = '';
            window.location.href = "../index.html";
        }
        ).catch(err => {
            loginForm.querySelector('[login-up-error]').innerHTML = err.message;
        })
    })
}