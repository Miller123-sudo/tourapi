import '@babel/polyfill';
import { login, logout, signup, updatePassword, forgotPassword } from './login';

// DOM ELEMENTS
const loginForm = document.querySelector('.login_button');
const logoutBtn = document.querySelector('.button_logout');
const signupBtn = document.querySelector('.signup_btn');
const updatePasswordBtn = document.querySelector('.update-pass-btn');
const forgotPasswordBtn = document.querySelector('.forgot-pass-btn');
const resetPasswordBtn = document.querySelector('.reset-btn');



if (loginForm) {
    loginForm.addEventListener('click', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (signupBtn) {
    signupBtn.addEventListener('click', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        signup(name, email, role, password, confirmPassword);

    });
}

if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener('click', async e => {

        e.preventDefault();
        const currentPassword = document.getElementById('oldpassword').value;
        const password = document.getElementById('newpassword').value;
        const passwordConfirm = document.getElementById('confirmpassword').value;
        console.log(currentPassword, password, passwordConfirm);

        await updatePassword({ currentPassword, password, passwordConfirm });

        document.getElementById('oldpassword').value = '';
        document.getElementById('newpassword').value = '';
        document.getElementById('confirmpassword').value = '';

    });
}

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async e => {

        e.preventDefault();
        const forgotPasswordEmail = document.getElementById('forgot-password-email').value;
        console.log(forgotPasswordEmail);
        await forgotPassword(forgotPasswordEmail);

    });
}

if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async e => {

        e.preventDefault();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const resetToken = document.getElementById('token').value;
        console.log(password, passwordConfirm, resetToken);

        // await resetPassword(password, passwordConfirm, resetToken);

    });
}