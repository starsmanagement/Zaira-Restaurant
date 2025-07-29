document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const dishList = document.getElementById("dishList");
  const subtotalElem = document.getElementById("subtotal");
  const totalElem = document.getElementById("total");
  const qrPopup = document.getElementById("qrPopup");
  const closeQR = document.getElementById("closeQR");
  const qrImg = document.querySelector(".qr-img");
  const upiText = document.getElementById("upiText");
  const whatsappText = document.getElementById("whatsappText");
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const proceedBtn = document.getElementById("proceedBtn");
  const customerForm = document.getElementById("customerForm");
  const orderModeRadios = document.querySelectorAll('input[name="orderMode"]');
  const deliveryInput = document.getElementById("deliveryInput");
  const pickupInput = document.getElementById("pickupInput");
  const locateBtn = document.getElementById("locateBtn");
  const deliveryField = document.getElementById("deliveryLocation");
  const pickupBranch = document.getElementById("pickupBranch");
  const areaStatus = document.getElementById("areaStatus");

  const LOCATIONIQ_TOKEN = "pk.fb4832200070d3edeea67b7f02efb075";
  const LOCATIONIQ_SEARCH_API = `https://us1.locationiq.com/v1/search.php`;
  const LOCATIONIQ_REVERSE_API = `https://us1.locationiq.com/v1/reverse.php`;

  const suggestionsContainer = document.createElement("ul");
  suggestionsContainer.id = "addressSuggestions";
  suggestionsContainer.classList.add("address-Suggestion");
  deliveryInput.appendChild(suggestionsContainer);

  const SERVICE_FEE = 69;
  const DELIVERY_RANGE_KM = 5;

  const restaurantLocations = [
    { name: "Zaira Restaurant Tiruvallur", lat: 13.13771, lon: 79.91011 },
    { name: "Zaira Multicuisine Restaurant Sriperumbudur", lat: 12.97547, lon: 79.95753 },
  ];

  const branchDetails = {
    "Zaira Restaurant Tiruvallur": {
      qrImage: "/Images/qr-code.webp",
      upiId: "q489355793@ybl",
      whatsappNumber: "919499905786",
    },
    "Zaira Multicuisine Restaurant Sriperumbudur": {
      qrImage: "/Images/qr-code.webp",
      upiId: "q457445315@ybl",
      whatsappNumber: "919499906786",
    },
  };

  let checkoutData = JSON.parse(localStorage.getItem("checkoutData")) || { items: [], subtotal: 0 };
  let isServiceable = false;
  proceedBtn.disabled = true;

  // Restore previous selections
  if (localStorage.getItem("zairaDeliveryLocation"))
    deliveryField.value = localStorage.getItem("zairaDeliveryLocation");
  if (localStorage.getItem("zairaPickupBranch"))
    pickupBranch.value = localStorage.getItem("zairaPickupBranch");

  // Utilities
  const saveLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const getLocal = (key) => JSON.parse(localStorage.getItem(key));

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const checkServiceability = (lat, lon) => {
    return restaurantLocations.some(branch => getDistance(lat, lon, branch.lat, branch.lon) <= DELIVERY_RANGE_KM);
  };

  const showStatus = (msg, color) => {
    areaStatus.textContent = msg;
    areaStatus.style.color = color;
  };

  // Debounce for suggestions
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 3) return suggestionsContainer.innerHTML = "";
    const res = await fetch(`${LOCATIONIQ_SEARCH_API}?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(query)}&format=json&limit=10`);
    const data = await res.json();
    suggestionsContainer.innerHTML = "";
    if (!data.length || data.error) return;

    data.forEach(place => {
      const li = document.createElement("li");
      li.textContent = place.display_name;
      li.style.cssText = "padding:5px;cursor:pointer;border-bottom:1px solid #eee;";
      li.addEventListener("click", () => {
        deliveryField.value = place.display_name;
        suggestionsContainer.innerHTML = "";
        handleLocationSelection(parseFloat(place.lat), parseFloat(place.lon));
      });
      suggestionsContainer.appendChild(li);
    });
  }, 300);

  deliveryField.addEventListener("input", (e) => {
    fetchSuggestions(e.target.value);
    areaStatus.textContent = "";
  });

  function handleLocationSelection(lat, lon) {
    isServiceable = checkServiceability(lat, lon);
    proceedBtn.disabled = !isServiceable;
    showStatus(isServiceable ? "✅ Congrats, We deliver here!" : "❌ Sorry! , This area is Currently not Serviceable!!", isServiceable ? "green" : "red");
    saveLocal("zairaUserLat", lat);
    saveLocal("zairaUserLon", lon);
  }

  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`${LOCATIONIQ_REVERSE_API}?key=${LOCATIONIQ_TOKEN}&lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      deliveryField.value = data.display_name || `${latitude}, ${longitude}`;
      handleLocationSelection(latitude, longitude);
    }, () => alert("Enable location services."));
  });

  // Keyboard navigation in suggestions
  let selectedIndex = -1;
  deliveryField.addEventListener("keydown", (e) => {
    const suggestions = document.querySelectorAll(".address-Suggestion li");
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % suggestions.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === "Enter" && selectedIndex > -1) {
      e.preventDefault();
      suggestions[selectedIndex].click();
      selectedIndex = -1;
    }

    suggestions.forEach((item, index) => {
      item.classList.toggle("active", index === selectedIndex);
    });
  });

  function updateDisplay() {
    dishList.innerHTML = "";
    let subtotal = 0;
    checkoutData.items.forEach((item, i) => {
      subtotal += item.price * item.quantity;
      dishList.insertAdjacentHTML("beforeend", `
        <div class="summary-item">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="qty-stepper">
              <button data-action="decrement" data-index="${i}">-</button>
              <span>${item.quantity}</span>
              <button data-action="increment" data-index="${i}">+</button>
            </div>
          </div>
          <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `);
    });

    subtotalElem.textContent = `₹${subtotal.toFixed(2)}`;
    totalElem.textContent = `₹${(subtotal + SERVICE_FEE).toFixed(2)}`;
    checkoutData.subtotal = subtotal;
    saveLocal("checkoutData", checkoutData);
  }

  dishList.addEventListener("click", (e) => {
    const btn = e.target;
    if (btn.tagName !== "BUTTON") return;
    const index = +btn.dataset.index;
    const action = btn.dataset.action;
    if (action === "increment") checkoutData.items[index].quantity++;
    if (action === "decrement") {
      checkoutData.items[index].quantity > 1
        ? checkoutData.items[index].quantity--
        : checkoutData.items.splice(index, 1);
    }
    updateDisplay();
  });

  orderModeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const isDelivery = radio.value === "delivery";
      deliveryInput.style.display = isDelivery ? "block" : "none";
      pickupInput.style.display = isDelivery ? "none" : "block";
      proceedBtn.disabled = isDelivery && !isServiceable;
    });
  });

  proceedBtn.addEventListener("click", () => {
    const formData = new FormData(customerForm);
    const name = formData.get("name");
    const mobile = formData.get("mobile");
    if (!name || !mobile) return alert("Fill Name & Mobile first.");
    const orderMode = document.querySelector('input[name="orderMode"]:checked')?.value || "";

    const branchKey = orderMode === "pickup" ? pickupBranch.value.trim() : "Zaira Restaurant Tiruvallur";
    const branch = branchDetails[branchKey] || branchDetails["Zaira Restaurant Tiruvallur"];

    qrImg.setAttribute("src", branch.qrImage);
    qrImg.setAttribute("loading", "lazy");
    qrImg.setAttribute("alt", branch.qrImage.split("/").pop().replace(/\.\w+$/, "").replace(/[-_]/g, " ") + " QR");

    upiText.textContent = branch.upiId;
    whatsappText.href = `https://wa.me/${branch.whatsappNumber}`;
    whatsappText.textContent = `+${branch.whatsappNumber}`;

    const customerData = {
      name,
      mobile,
      email: formData.get("email")?.trim() || "",
      additionalNotes: formData.get("notes")?.trim() || "",
    };
    if (orderMode === "delivery")
      saveLocal("zairaDeliveryLocation", deliveryField.value.trim());
    if (orderMode === "pickup")
      saveLocal("zairaPickupBranch", pickupBranch.value.trim());

    saveLocal("zairaCustomer", customerData);
    qrPopup.style.display = "flex";
  });

  closeQR.addEventListener("click", () => {
    qrPopup.style.display = "none";
    alert("Payment canceled.");
  });

  confirmPaymentBtn.addEventListener("click", () => {
    const checkoutData = getLocal("checkoutData");
    const customer = getLocal("zairaCustomer");
    if (!checkoutData || !customer) return alert("Missing order or customer details.");

    const dishes = checkoutData.items.map(i => `${i.name} × ${i.quantity}`).join(" | ");
    const total = checkoutData.subtotal + SERVICE_FEE;
    const orderMode = document.querySelector('input[name="orderMode"]:checked')?.value || "";
    const locationNote = orderMode === "delivery"
      ? `📍 *Delivery Location:* ${deliveryField.value.trim() || "N/A"}\n`
      : `🏪 *Pickup Branch:* ${pickupBranch.value.trim() || "N/A"}\n`;

    const message = `
*New Order - Zaira Restaurant*
👤 Name: ${customer.name}
📱 Mobile: ${customer.mobile}
✉️ Email: ${customer.email || "N/A"}
🛒 Order: ${dishes}
💰 Total: ₹${total}
📦 Mode: ${orderMode.toUpperCase()}
${locationNote}
📝 Notes: ${customer.additionalNotes || "None"}
    `.trim();

    const branch = branchDetails[pickupBranch.value.trim()] || branchDetails["Zaira Restaurant Tiruvallur"];
    window.open(`https://wa.me/${branch.whatsappNumber}?text=${encodeURIComponent(message)}`);
  });

  // Preselect first branch
  pickupBranch.selectedIndex = 0;
  updateDisplay();
});
