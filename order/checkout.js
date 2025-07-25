document.addEventListener("DOMContentLoaded", () => {
  const dishList = document.getElementById("dishList");
  const subtotalElem = document.getElementById("subtotal");
  const totalElem = document.getElementById("total");
  const qrPopup = document.getElementById("qrPopup");
const closeQR = document.getElementById("closeQR");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const proceedBtn = document.getElementById("proceedBtn");
  const customerForm = document.getElementById("customerForm");

  let checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || { items: [], subtotal: 0 };
  const serviceFee = 69;

  function updateDisplay() {
    dishList.innerHTML = "";
    let subtotal = 0;

    checkoutData.items.forEach((item, index) => {
      subtotal += item.price * item.quantity;

      const dishRow = document.createElement("div");
      dishRow.className = "summary-item";

      dishRow.innerHTML = `
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="qty-stepper">
            <button data-action="decrement" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button data-action="increment" data-index="${index}">+</button>
          </div>
        </div>
        <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
      `;

      dishList.appendChild(dishRow);
    });

    subtotalElem.textContent = `₹${subtotal.toFixed(2)}`;
    totalElem.textContent = `₹${(subtotal + serviceFee).toFixed(2)}`;

    // Save updated subtotal
    checkoutData.subtotal = subtotal;
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
  }

  // Quantity Button Click Handler
  dishList.addEventListener("click", (e) => {
    const btn = e.target;
    if (btn.tagName !== "BUTTON") return;

    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-index"));

    if (action === "increment") {
      checkoutData.items[index].quantity += 1;
    } else if (action === "decrement" && checkoutData.items[index].quantity > 1) {
      checkoutData.items[index].quantity -= 1;
    }

    updateDisplay();
  });

  // Show QR code on Proceed to Checkout
  proceedBtn.addEventListener("click", () => {
  // Auto-save customer info
  const formData = new FormData(customerForm);
  const name = formData.get("name");
  const mobile = formData.get("mobile");
    const email = formData.get("email")?.trim() || '';
  const notes = formData.get("notes")?.trim() || '';

  if (!name || !mobile) {
    alert("Please fill in Your Name & Contact before proceeding.");
    return;
  }

  const customerDetails = {
    name,
    mobile,
    email,
    additionalNotes: notes || ''
  };

  localStorage.setItem("zairaCustomer", JSON.stringify(customerDetails));

  // Then show the QR popup
  qrPopup.style.display = "flex";
});


  closeQR.addEventListener("click", () => {
  qrPopup.style.display = "none";
  alert("Cancel Payment !");
});


 

 confirmPaymentBtn.addEventListener("click", () => {
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  const customerData = JSON.parse(localStorage.getItem("zairaCustomer"));


  if (!checkoutData || !customerData) {
    alert("Missing order or customer details.");
    return;
  }

  const dishes = checkoutData.items.map(item => `${item.name} × ${item.quantity}`).join(' | ');
  const total = checkoutData.subtotal + serviceFee;

const message = `
*New Order - Zaira Restaurant*
👤 Name: ${customerData.name} ,
📱 Mobile: ${customerData.mobile} ,
✉️ Email: ${customerData.email || 'N/A'} ,
📝 Notes: ${customerData.additionalNotes || 'N/A'} ,
--------------------------------------------
🍽️ Dishes: ${dishes}
💰 Total: ₹${total}
  `;

  const phoneNumber = "919499905786";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURI(message)}`;

  // Open WhatsApp with message
  window.open(whatsappURL);

  // 🔁 Clear cart and customer info from localStorage
  localStorage.removeItem("checkoutData");
  localStorage.removeItem("zairaCustomer");
  localStorage.removeItem("zairaCart");

  

  // 🧹 Also clear from the current page view
  dishList.innerHTML = "";
  subtotalElem.textContent = "₹0.00";
  totalElem.textContent = "₹0.00";

  // Optionally close QR popup
  qrPopup.style.display = "none";

});



  updateDisplay();
});
