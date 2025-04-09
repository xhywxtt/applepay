import VConsole from 'vconsole';

// Initialize vConsole for mobile debugging
new VConsole();

// Initialize Stripe with test publishable key
const stripe = Stripe('pk_test_51L1Fn6GlGJzWWZjtLSUOrxi8dWQg6y0P9IVyQYPcMZGzrzWtFEjR6FbnUYp8dSUD6cFMHv4iyetKECGOzG9IMOFI00iCyXqq1t');

// Create Elements instance with necessary options
const elements = stripe.elements({
  mode: 'payment',
  amount: 50, // Amount remains the same
  currency: 'usd',
});

// Create and mount Express Checkout Element
const expressCheckoutElement = elements.create('expressCheckout', {
  emailRequired: true,
  paymentMethods: {
    applePay: "always",
    amazonPay: "never",
    googlePay: "never",
    link: "never",
    paypal: "never"
  }
});

// Initialize payment request button
async function initialize() {
  // TODO temp
  await fetch('https://e406-2404-f801-8050-3-702d-5709-269f-1d5f.ngrok-free.app/PaymentIntent/create-intent', {
    method: 'POST',
  });
  const mountElement = document.getElementById('express-checkout-element');
  if (mountElement) {
    expressCheckoutElement.mount('#express-checkout-element');
  }
}

// Handle payment error
function handlePaymentError(error) {
  console.error('handlePaymentError - Error:', error);
  const statusElement = document.getElementById('payment-status');
  if (statusElement) {
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.className = 'payment-status error';
  }
  console.error('Payment error:', error);
}

// Handle payment request events
expressCheckoutElement.on('confirm', async (event) => {
  try {
    const {error: submitError} = await elements.submit();
    if (submitError) {
      handlePaymentError(submitError);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret
    // TODO 需要后端支持
    const res = await fetch('https://e406-2404-f801-8050-3-702d-5709-269f-1d5f.ngrok-free.app/PaymentIntent/create-intent', {
      method: 'POST',
    });
    const {client_secret: clientSecret} = await res.json();

    const {error} = await stripe.confirmPayment({
      // `elements` instance used to create the Express Checkout Element
      elements,
      // `clientSecret` from the created PaymentIntent
      clientSecret,
      confirmParams: {
        return_url: '/return.html',
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the payment. Show the error to your customer (for example, payment details incomplete)
      handlePaymentError(error);
    } else {
      // The payment UI automatically closes with a success animation.
      // Your customer is redirected to your `return_url`.
    }
  } catch (error) {
    handlePaymentError(error instanceof Error ? error : new Error('Unknown error'));
  }
});

// Start the payment flow
initialize().catch(error => {
  console.error('Initialization error:', error);
  handlePaymentError(error instanceof Error ? error : new Error('Unknown error'));
});