const PAYPAL_SDK_URL = "https://www.paypal.com/sdk/js";
const CURRENCY = "USD";
const INTENT = "capture";

let paymentClientId;

async function fetchConfig() {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    if (!config || !config.payment_client_id) {
      throw new Error("Invalid config received or missing payment_client_id");
    }
    return config.payment_client_id;
  } catch (error) {
    const alerts = document.getElementById("alerts");
    if (alerts) {
      alerts.innerText = "Failed to load payment options. Please refresh the page or try again later.";
    }
    console.error("Error fetching config:", error);
    throw error;
  }
}

function loadPaypalSdk() {
  if (!paymentClientId) {
    return Promise.reject(new Error("Client ID not available when loadPaypalSdk was called"));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PAYPAL_SDK_URL}?client-id=${paymentClientId}&currency=${CURRENCY}&intent=${INTENT}`;
    script.onload = resolve;
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
}

async function initializePayPalButtons() {
  try {
    paymentClientId = await fetchConfig();
    await loadPaypalSdk();

    if (typeof paypal === 'undefined') {
      throw new Error("PayPal SDK loaded but 'paypal' object is undefined.");
    }

    paypal.Buttons({
      style: { layout: 'vertical' },

      createOrder: () => {
        return fetch("/create_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: INTENT })
        })
          .then(response => {
            if (!response.ok) {
              return response.json().then(error => {
                throw new Error(error.message || `Failed to create order (${response.status})`);
              });
            }
            return response.json();
          })
          .then(order => {
            if (!order?.id) {
              throw new Error("Invalid order data received from server");
            }
            return order.id;
          })
          .catch(error => {
            document.getElementById("alerts").innerText = "Could not initiate payment. Please try again.";
            throw error;
          });
      },

      onApprove: (data) => {
        document.getElementById("alerts").innerText = "Processing payment...";
        return fetch("/complete_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: INTENT, order_id: data.orderID })
        })
          .then(response => {
            if (!response.ok) {
              return response.json().then(error => {
                throw new Error(error.message || `Failed to complete order (${response.status})`);
              });
            }
            return response.json();
          })
          .then(order => {
            if (!order?.purchase_units?.[0]?.payments) {
              throw new Error("Invalid order details received after completion.");
            }
            const paymentType = INTENT === "authorize" ? "authorizations" : "captures";
            const payment = order.purchase_units[0].payments[paymentType]?.[0];
            if (!payment?.amount) {
              throw new Error("Payment details missing in completion response.");
            }

            const payerName = order.payer?.name?.given_name || 'customer';
            const { value: amount, currency_code: currencyCode } = payment.amount;
            document.getElementById("alerts").innerText =
              `Thank you ${payerName}! Payment of ${amount} ${currencyCode} received.`;
          })
          .catch(error => {
            document.getElementById("alerts").innerText = "Payment approved, but could not finalize. Please contact support.";
            throw error;
          });
      },

      onCancel: () => {
        document.getElementById("alerts").innerText = "Payment cancelled.";
      },

      onError: (error) => {
        document.getElementById("alerts").innerText = "An error occurred during the payment process. Please try again.";
      }
    }).render('#paypal-button-container');

  } catch (error) {
    
  }
}

initializePayPalButtons();