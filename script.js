const menuCards = document.getElementById("menuCards");
const container = document.getElementById("subCategoryButtons");

// Slide Show for Hero Images
let slideIndex = 0;
const slides = document.getElementsByClassName("slides");

function showMenuSlides() {
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex = (slideIndex + 1 > slides.length) ? 1 : slideIndex + 1;
  slides[slideIndex - 1].style.display = "block";
}

// Start slideshow
if (slides.length > 0) {
  showMenuSlides(); // Show first slide immediately
  setInterval(showMenuSlides, 3000);
}

// Subcategories by Menu Type
const subCategories = {
  starters: [
    "Chettinad Soup's",
    "Soup's",
    "Chettinad Starters",
    "Chinese Starters Veg",
    "Chinese Starters NonVeg",
    "Sea Foods Starters"
  ],
  "main-course": [
    "Chinese Dry & Gravy Veg",
    "Chinese Dry & Gravy NonVeg",
    "Lamb Dry & Gravy",
    "Egg Specials",
    "Tikka Specials",
    "Kebab",
    "Platter",
    "Barbeque",
    "Chettinad Curry & Gravy",
    "Chettinad Fry",
    "Tandoori & naan's"
  ],
  "rice-noodles": ["Biriyani's", "Fried Rice", "noodles", "Accompaniment's"],
  beverages: ["mocktail & mojito", "Fruit Juice", "Shake"],
  desserts: ["Dessert & Falooda"]
};

function showSubCategories(categoryKey) {
  container.innerHTML = "";
  menuCards.innerHTML = "";

  subCategories[categoryKey].forEach((subButton) => {
    const subCatbtn = document.createElement("button");
    subCatbtn.textContent = subButton;
    subCatbtn.onclick = () => showMenuCards(subButton);
    container.appendChild(subCatbtn);
  });
}

function showAllMenuImages() {
  menuCards.innerHTML = "";
  container.innerHTML = "";

  const allWrapper = document.createElement("div");
  allWrapper.className = "all-menu-wrapper";

  for (const categoryKey in subCategories) {
    const subMenus = subCategories[categoryKey];

    subMenus.forEach((sub) => {
      const imageName = sub
        .toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      const img = document.createElement("img");
      img.src = `/menuImages/${imageName}.webp`;
      img.alt = sub;
      img.loading = "lazy";
      img.className = "allmenuImg";

      allWrapper.appendChild(img);
    });
  }

  menuCards.appendChild(allWrapper);
}

function showMenuCards(subMenuName) {
  menuCards.innerHTML = "";

  const imageName = subMenuName
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const img = document.createElement("img");
  img.src = `/menuImages/${imageName}.webp`;
  img.alt = subMenuName;
  img.loading = "lazy";
  img.className = "menuImg";

  menuCards.appendChild(img);
}

// Navbar Toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    console.log("Hamburger clicked", hamburger.classList.contains("active"));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
} else {
  console.error("Hamburger or navLinks not found in DOM.");
}


// Show/hide back to top button
window.addEventListener('scroll', function () {
  const backToTop = document.getElementById('backToTop');
  if (window.scrollY > 300) {
    backToTop.style.display = 'block';
  } else {
    backToTop.style.display = 'none';
  }
});

// Scroll smoothly to top
document.getElementById('backToTop').addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});



// Load all images by default
window.addEventListener("DOMContentLoaded", () => {
  showAllMenuImages();
});
