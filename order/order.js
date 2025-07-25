document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("menu-container");
  const sidebarList = document.getElementById("sidebar-links");
  const backToTop = document.getElementById("backToTop");
  const cartSidebar = document.getElementById("cartSidebar");
  const cartToggle = document.getElementById("cartToggle");
  const closeCart = document.getElementById("closeCart");
  const cartItemsContainer = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("subtotal");
  const cartCount = document.getElementById("cart-count");
  const addMoreItemsBtn = document.getElementById("addMoreItemsBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const floatingCartCount = document.getElementById("floatingCartCount");


  const cart = {};
  const cardSteppers = {};

  const savedCart = localStorage.getItem("zairaCart");
  if (savedCart) {
    Object.assign(cart, JSON.parse(savedCart));
  }
  updateCartUI();

  window.changeQty = changeQty;
  window.addToCart = addToCart;
  window.removeItem = removeItem;

  // Fetch dishes and build UI
  fetch("dishes.json")
    .then((response) => response.json())
    .then((data) => buildMenu(data))
    .catch((err) => showError(err));

  function buildMenu(data) {
    const categories = groupByCategory(data);
    createSidebarLinks(categories);

    for (const [category, subCats] of Object.entries(categories)) {
      const catSection = document.createElement("section");
      catSection.className = "category-section";
      catSection.id = formatId(category);

      const catHeading = document.createElement("h2");
      catHeading.textContent = category;
      catHeading.className = "category-heading";
      catSection.appendChild(catHeading);

      for (const [subCategory, dishes] of Object.entries(subCats)) {
        const subHeading = document.createElement("h3");
        subHeading.textContent = subCategory;
        subHeading.className = "subcategory-heading";
        subHeading.id = formatId(`${category}-${subCategory}`);
        catSection.appendChild(subHeading);

        const dishGrid = document.createElement("div");
        dishGrid.className = "dish-grid";

        dishes.forEach((dish) => {
          const card = createDishCard(dish);
          dishGrid.appendChild(card);
        });

        catSection.appendChild(dishGrid);
      }

      container.appendChild(catSection);
    }
  }

  function groupByCategory(data) {
    const categories = {};
    data.forEach((dish) => {
      const { category, subCategory } = dish;
      if (!categories[category]) categories[category] = {};
      if (!categories[category][subCategory])
        categories[category][subCategory] = [];
      categories[category][subCategory].push(dish);
    });
    return categories;
  }

  function showError(err) {
    container.innerHTML = `<p class="error">Failed to load menu. Please try again later.</p>`;
    console.error("Error loading dishes.json:", err);
  }

  function formatId(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/gi, "");
  }

  function createDishCard(dish) {
    const { name, price, description, type, id } = dish;

    const card = document.createElement("div");
    card.className = `dish-card ${type.toLowerCase()}`;

    card.innerHTML = `
      <h4>${name}</h4>
      <p>${description}</p>
      <div class="price">₹ ${price}.00</div>
      <span class="type-badge ${type.toLowerCase()}">${type}</span>
    `;

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add to Cart";
    addBtn.className = "add-btn";
    addBtn.onclick = () => {
      addToCart(dish);
      showQtyStepper(addBtn, dish);
    };

    card.appendChild(addBtn);

    if (cart[id] && cart[id].quantity > 0) {
    // Dish is already in cart, show the stepper directly
    showQtyStepper(addBtn, dish);
  }   
  return card;
  }

  function showQtyStepper(btn, dish) {
    const id = dish.id;
    const stepper = document.createElement("div");
    stepper.className = "qty-stepper";

    const downBtn = document.createElement("button");
    const upBtn = document.createElement("button");
    const countSpan = document.createElement("span");

    downBtn.textContent = "▼";
    upBtn.textContent = "▲";

    downBtn.onclick = () => {
      changeQty(id, -1);
      if (!cart[id]) {
        btn.textContent = "Add to Cart";
        stepper.replaceWith(btn);
      } else {
        countSpan.textContent = cart[id].quantity;
      }
    };

    upBtn.onclick = () => {
      changeQty(id, 1);
      countSpan.textContent = cart[id].quantity;
    };

    countSpan.textContent = cart[id]?.quantity || 1;
    cardSteppers[id] = { stepper, countSpan, btn };
    stepper.append(downBtn, countSpan, upBtn);
    btn.replaceWith(stepper);
  }

  function addToCart(dish) {
    const id = dish.id;
    if (cart[id]) {
      cart[id].quantity += 1;
    } else {
      cart[id] = { ...dish, quantity: 1 };
    }
    updateCartUI();
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;

    cart[id].quantity += delta;
    if (cart[id].quantity <= 0) delete cart[id];

    updateCartUI();
  }

  function removeItem(id) {
    if (cart[id]) {
      delete cart[id];
      updateCartUI();
    }
  }

  function updateCartUI() {
    cartItemsContainer.innerHTML = "";

    const items = Object.values(cart);
    let subtotal = 0;

    if (items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <img src="/Images/emptyplate.png" alt="">
          <p>Plates look best with food on it. Go, grab ’em all</p>
        </div>
      `;
      subtotalElement.textContent = "0.00";
      cartCount.textContent = "0";

      Object.keys(cart).forEach(key => delete cart[key]);
  localStorage.removeItem("zairaCart");

  
  if (floatingCartCount) floatingCartCount.textContent = "0";

      return;
    }

    items.forEach((item) => {
      subtotal += item.price * item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
  <div class="cart-item-top">
    <div class="item-name">${item.name}</div>
    <button class="delete-item" onclick="removeItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
  </div>
  <div class="cart-item-bottom">
    <div class="item-controls">
      <button onclick="changeQty('${item.id}', -1)">−</button>
      <span>${item.quantity}</span>
      <button onclick="changeQty('${item.id}', 1)">+</button>
    </div>
    <div class="item-total">₹ ${(item.price * item.quantity).toFixed(2)}</div>
  </div>
`;

      cartItemsContainer.appendChild(itemDiv);
    });

    subtotalElement.textContent = subtotal.toFixed(2);
    cartCount.textContent = items.reduce((sum, i) => sum + i.quantity, 0);

    if (floatingCartCount) {
      floatingCartCount.textContent = items.reduce(
        (sum, i) => sum + i.quantity,
        0
      );
    }

    syncDishCardQuantities();
    localStorage.setItem("zairaCart", JSON.stringify(cart));
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const additionalInfo =
        document.querySelector(".order-notes")?.value || "";

      const items = Object.values(cart); // Already available in memory
      if (items.length === 0) {
        alert("Your cart is empty. Please add items before proceeding.");
        return;
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const checkoutData = {
        items,
        subtotal,
        additionalInfo,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Navigate to checkout page
      window.location.href = "checkout.html";
    });
  }

  function syncDishCardQuantities() {
    Object.keys(cardSteppers).forEach((dishId) => {
      const ref = cardSteppers[dishId];
      if (!cart[dishId]) {
        ref.stepper.replaceWith(ref.btn);
        delete cardSteppers[dishId];
      } else {
        ref.countSpan.textContent = cart[dishId].quantity;
      }
    });
  }

  function createSidebarLinks(categories) {
    for (const [category, subCats] of Object.entries(categories)) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${formatId(category)}`;
      a.textContent = category;
      li.appendChild(a);

      const subCatKeys = Object.keys(subCats);
      if (subCatKeys.length > 1) {
        const subUl = document.createElement("ul");
        subUl.className = "sub-links";
        subUl.style.display = "none";

        subCatKeys.forEach((subCat) => {
          const subLi = document.createElement("li");
          const subA = document.createElement("a");
          subA.href = `#${formatId(`${category}-${subCat}`)}`;
          subA.textContent = subCat;
          subLi.appendChild(subA);
          subUl.appendChild(subLi);
        });

        li.appendChild(subUl);
      }

      sidebarList.appendChild(li);
    }
  }

  if (addMoreItemsBtn) {
    addMoreItemsBtn.addEventListener("click", () => {
      cartSidebar.classList.remove("show"); // Close the cart
      document
        .getElementById("menu-container")
        ?.scrollIntoView({ behavior: "smooth" }); // Scroll to menu
    });
  }

  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll(".category-section");
    const scrollPos = window.scrollY + 150;

    sections.forEach((section) => {
      const id = section.id;
      if (scrollPos >= section.offsetTop) {
        document.querySelectorAll(".sidebar a").forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });

        document.querySelectorAll(".sidebar .sub-links").forEach((ul) => {
          ul.style.display = "none";
        });

        const currentLi = [...document.querySelectorAll(".sidebar li")].find(
          (li) => li.querySelector("a")?.getAttribute("href") === `#${id}`
        );

        if (currentLi?.querySelector(".sub-links")) {
          currentLi.querySelector(".sub-links").style.display = "block";
        }
      }
    });

    if (backToTop) {
      if (window.scrollY > 300) {
        backToTop.style.display = "block";
      } else {
        backToTop.style.display = "none";
      }
    }
  });

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.querySelector(".sidebar");

  // Toggle sidebar on button click
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });

  // Close sidebar when any sidebar link is clicked (mobile only)
  sidebar.addEventListener("click", (e) => {
    const clickedElement = e.target;
    if (clickedElement.tagName === "A") {
      sidebar.classList.remove("show");
    }
  });

  const floatingCartBtn = document.getElementById("floatingCartBtn");

  if (floatingCartBtn) {
    floatingCartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("show");
    });
  }




  cartToggle.onclick = () => cartSidebar.classList.add("show");
  closeCart.onclick = () => cartSidebar.classList.remove("show");
  backToTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
});
