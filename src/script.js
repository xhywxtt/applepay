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
  }
});

// Initialize payment request button
async function initialize() {
  const mountElement = document.getElementById('express-checkout-element');
  if (mountElement) {
    expressCheckoutElement.mount('#express-checkout-element');
  }
}

// Handle successful payment method creation
function handlePaymentMethodCreated(paymentMethodId) {
  console.log('handlePaymentMethodCreated - Payment Method ID:', paymentMethodId);
  const statusElement = document.getElementById('payment-status');
  if (statusElement) {
    statusElement.textContent = `Payment Method ID created: ${paymentMethodId}`;
    statusElement.className = 'payment-status success';
  }
  console.log('Payment Method ID:', paymentMethodId);
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
    const {error} = await stripe.confirmPayment({
      elements,
      // Note: You need to get clientSecret from your server
      clientSecret: 'YOUR_CLIENT_SECRET',
      confirmParams: {
        return_url: 'https://your-domain.com/order/complete',
      },
    });

    if (error) {
      handlePaymentError(error);
    }
    // Customer will be redirected to return_url after successful payment
  } catch (error) {
    handlePaymentError(error instanceof Error ? error : new Error('Unknown error'));
  }
});

// Start the payment flow
initialize().catch(error => {
  console.error('Initialization error:', error);
  handlePaymentError(error instanceof Error ? error : new Error('Unknown error'));
});