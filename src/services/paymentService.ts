class PaymentService {
  private apiUrl = 'http://localhost:3001/api/payment';

  async createPaymentIntent(orderData: any) {
    try {
      console.log('Creating payment intent for order:', orderData);
      
      const response = await fetch(`${this.apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment intent created:', data);
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, orderId: string) {
    try {
      console.log('Verifying payment:', { paymentId, orderId });
      
      const response = await fetch(`${this.apiUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment verification result:', data);
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async initializePayment(
    orderData: any,
    user: any,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ) {
    try {
      console.log('Initializing payment for order:', orderData);
      
      // Create payment intent on backend
      const paymentIntent = await this.createPaymentIntent({
        amount: orderData.total * 100, // Convert to paise
        currency: 'INR',
        customer: {
          name: user.name,
          email: user.email,
          phone: orderData.customerPhone
        },
        order: {
          id: orderData.id,
          items: orderData.items,
          deliveryAddress: orderData.address
        }
      });

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay test key
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        name: 'Tabuloo',
        description: 'Food Order Payment',
        order_id: paymentIntent.order_id,
        handler: onSuccess,
        prefill: {
          name: user.name,
          email: user.email,
          contact: orderData.customerPhone
        },
        theme: {
          color: '#DC2626'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', onError);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error);
    }
  }
}

export default new PaymentService(); 