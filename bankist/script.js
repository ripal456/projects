'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Ripal Shah',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Harshada Shinde',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'en-US',
};

const accounts = [account1, account2];

// // Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// const array = ['r', 'a', 'q', 'r', 'h', 'p'];
// array.slice(2, 4);
// // console.log(array.splice(2, 4));
// // console.log(array.reverse());
// console.log(array);
// const array2 = ['d', 'g', 'f', 't'];
// console.log(array.concat(array2));
// console.log([...array, ...array2].join());

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// movements.forEach(function (movement, index, array) {
//   if (movement >= 0) {
//     console.log(
//       `Movement ${index + 1} : ${movement} amount is deposit in your account `
//     );
//   } else if (movement < 0) {
//     console.log(
//       `Movement ${index + 1} : ${Math.abs(
//         movement
//       )} amount is withdraw from your account`
//     );
//   }
// });

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key} : ${value}`);
// });

// const currenciesUniqueInput = new Set(['USD', 'EUR', 'INR', 'EUR', 'INR']);

// currenciesUniqueInput.forEach(function (value, _, set) {
//   console.log(`${value}`);
// });

//  functions

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatMomentsDates = function (date, locale) {
  const calcPassedDay = (date1, date2) => {
    // console.log(Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)));
    return Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };

  const daysPassed = calcPassedDay(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth()}`.padStart(2, 0);
  // const year = `${date.getFullYear()}`;
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMomentsDates(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    // const formattedMov = new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency,
    // }).format(mov);

    const html = `   <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1}${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// total balance
const calcDisplayBalance = function (accs) {
  // console.log(accs);
  accs.balance = accs.movements.reduce((acc, cur) => acc + cur);
  labelBalance.textContent = formatCur(
    accs.balance,
    accs.locale,
    accs.currency
  );
};

// display income , outcome and interest rate
const calcDisplaySummary = function (accs, int) {
  const income = accs.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur);

  const outcome = Math.abs(
    accs.movements.filter(mov => mov < 0).reduce((acc, cur) => acc + cur)
  );

  const interestRate = accs.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * accs.interestRate) / 100)
    .reduce((acc, cur) => acc + cur);

  console.log(interestRate);
  labelSumIn.textContent = formatCur(
    Math.abs(income),
    accs.locale,
    accs.currency
  );
  labelSumOut.textContent = formatCur(
    Math.abs(outcome),
    accs.locale,
    accs.currency
  );

  labelSumInterest.textContent = formatCur(
    interestRate,
    accs.locale,
    accs.currency
  );
};

// show the deposit and withdrawal

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
  // console.log(accs);
};
createUserNames(accounts);

// console.log(accounts);

const deposit = movements.filter(mov => mov > 0);
const withdrawal = movements.filter(mov => mov < 0);

const upddateUI = function (acc) {
  // console.log(acc);
  // display balance
  calcDisplayBalance(acc);

  //display summary
  calcDisplaySummary(acc);

  // display movements
  displayMovements(acc);
};

// event handler

let currentAccount, timer;

//log our timer function
const setTimerLogout = function () {
  let time = 120;
  //call timer every time
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    // when reach 0 then clear timer
    if (time === 0) {
      clearInterval(setTimerLogout);
      labelWelcome.textContent = ` login in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display UI and message
    labelWelcome.textContent = ` Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    //opacity
    containerApp.style.opacity = 100;

    // clear all fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const date = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // const year = now.getFullYear();

    // labelDate.textContent = `${date}/${month}/${year} , ${hours}:${minutes}`;

    // timer
    if (timer) clearInterval(timer);
    timer = setTimerLogout();
    upddateUI(currentAccount);
  }
});

// transfer money

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferTo.value = inputTransferAmount.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add dates
    currentAccount.movementsDates.push(new Date().toDateString());
    currentAccount.movementsDates.push(new Date().toDateString());

    clearInterval(timer);
    timer = setTimerLogout();
    // console.log(currentAccount.movements);
    upddateUI(currentAccount);
  }
});

// function for loan request
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(acc => acc >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      // add laon date

      currentAccount.movementsDates.push(new Date().toISOString());

      clearInterval(timer);
      timer = setTimerLogout();
      // update UI
      upddateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

// funtion for close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // delete account
    accounts.splice(index, 1);

    //close UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
// const max = function (bal) {
//   const maxBal = bal.reduce((acc, cur) => {
//     if (acc > cur) {
//       return acc;
//     } else {
//       return cur;
//     }
//   });

//   console.log(maxBal);
// };
// max(account1.movements);

// const arr = [
//   3,
//   6,
//   4,
//   8,
//   [3, 9, 0],
//   7,
//   2,
//   [5, 23, 45],
//   6,
//   21,
//   48,
//   54,
//   [21, 69, 89],
// ];
// console.log(arr.flat(3));

// const overAllBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov);

// console.log(overAllBalance);

// const overAllBalance2 = accounts.flatMap(acc => acc.movements);
// console.log(overAllBalance2);

// const arr = [400, 521, -859, 120, 45, -950];
// console.log(arr);
// arr.sort((a, b) => a - b);

// console.log(arr);

// const x = new Array(7);
// x.fill(1, 6, 6);
// x.fill(1);
// console.log(x);
// const arr = [1, 2, 3, 4, 5, 6, 7];

// arr.fill(23, 2, 6);
// console.log(arr);

// const y = Array.from({ length: 7 }, (cur, i) => i++);
// console.log(y);

// const a = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((sum, cur) => sum + cur);

// const b = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
// console.log(a, b);

// const createTitleCase = function (title) {
//   const capitzalied = str => str[0].toUpperCase() + str.slice(1);
//   const exceptions = ['a', 'and', 'but', 'the', 'an', 'on', 'or', 'in', 'with'];
//   // console.log(str);
//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitzalied(word)))
//     .join(' ');

//   return capitzalied(titleCase);
// };

// createTitleCase('this is a chair and it is very expensive');
// console.log(createTitleCase('a chair is far from my city'));

// console.log(Number.parseInt('30'));
// console.log(Number.parseInt('30px'));
// console.log(Number.parseFloat('2.6'));
// console.log(Number.isNaN(230));
// console.log(Number.isNaN('20px'));
// console.log(Number.isNaN(+'2355X'));
// console.log(Number.isFinite(68468));

// //numerical separator
// console.log(45_665);

// console.log(7 % 5);
// // console.log(isEven(25));
// console.log(BigInt(3219433));
// console.log(49749445616498749841562561684n);
// // console.log(Math.sqrt(48384n));

// console.log(new Date());

