/* eslint-disable */
import '@babel/polyfill';
import { bookTour } from './stripe';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { update } from './updateSettings';
// import { showAlert } from './alert';

const logoutBtn = document.querySelector('.nav__el--logout');
const userData = document.querySelector('.form-user-data');
const userPassword = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
//dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    //values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// console.log(logoutBtn.addEventListener('click', logout));
logoutBtn.addEventListener('click', logout);

if (userData) {
  userData.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    console.log(bookBtn);
    update(form, ' your data');
  });
}
if (userPassword) {
  userPassword.addEventListener('submit', async e => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await update(
      { passwordCurrent, password, passwordConfirm },
      'your password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
