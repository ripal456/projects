/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const Stripe = require('stripe');
// import Stripe from 'stripe';

export const bookTour = async tourId => {
  try {
    const stripes = Stripe(
      'pk_test_51Oie1qFc3IWIZj4yp5cPXdB0YhtgHZ0nbHYXpe6iWEjaGa7epTC44GrxW741WgywlGwpZ1XDJUhKxROcfkZoW3vz00rrp2qaLM'
    );

    // 1 ger checkput session from API
    const session = await axios(`/api/v1/payment/checkout-session/${tourId}`);
    // console.log(session.data.session.id);
    // 2 create form for credit card checkout
    window.location.replace(session.data.session.url);
  } catch (err) {
    showAlert('error', err);
  }
};
