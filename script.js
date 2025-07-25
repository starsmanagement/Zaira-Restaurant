  const menuCards = document.getElementById('menuCards');
  const container = document.getElementById('subCategoryButtons');
 
 // To slide the Images
let slideIndex = 0;
showMenuSlides();

function showMenuSlides() {
  let slides = document.getElementsByClassName("slides");
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}
  slides[slideIndex-1].style.display = "block";
  setTimeout(showMenuSlides, 2000); 
}

// To include header and footer html files



// To show Menu Cards on MenuWebPage Dynamically

const subCategories = {
  starters : ["Chettinad Soup's", "Soup's", "Chettinad Starters", "Chinese Starters Veg","Chinese Starters NonVeg", "Sea Foods Starters"],
  "main-course" : ["Chinese Dry & Gravy Veg","Chinese Dry & Gravy NonVeg", "Lamb Dry & Gravy", "Egg Specials", "Tikka Specials", "Kebab", "Platter", "Barbeque", "Chettinad Curry & Gravy", "Chettinad Fry", "Tandoori & naan's"],
  "rice-noodles" : ["Biriyani's", "Fried Rice", "noodles", "Accompaniment's"],
  beverages : ["mocktail & mojito", "Fruit Juice", "Shake"],
  desserts : ["Dessert & Falooda"]
}


function showSubCategories(categoryKey){
  container.innerHTML = "";
  menuCards.innerHTML = "";

  subCategories[categoryKey].forEach(subButton => {
      const subCatbtn = document.createElement('button');
      subCatbtn.innerHTML = subButton;
      subCatbtn.onclick = () => showMenuCards(subButton);
      container.appendChild(subCatbtn);
  });
}

function showAllMenuImages() {
  menuCards.innerHTML = "";
  container.innerHTML = "";
  
  const allWrapper = document.createElement('div');
  allWrapper.className = "all-menu-wrapper";

  for (const categoryKey in subCategories) {
    const subMenus = subCategories[categoryKey];

    subMenus.forEach(sub => {
      const imageName = sub
        .toLowerCase()
        .replace(/'/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      const img = document.createElement('img');
      img.src = `/menuImages/${imageName}.jpg`;
      img.alt = sub;
      img.className = "allmenuImg";

      allWrapper.appendChild(img);
      menuCards.appendChild(allWrapper);
    });
  }
     
}


function showMenuCards(subMenuName){
  menuCards.innerHTML = "";

  const imageName = subMenuName
          .toLowerCase()
          .replace(/'/g, "") 
          .replace(/[^a-z0-9]+/g, "_")  // replace non-alphanumeric with "_"
          .replace(/^_+|_+$/g, "");     // trim leading/trailing "_"


  const img = document.createElement('img');
  img.src = `/menuImages/${imageName}.jpg`;
  img.alt = subMenuName;
  img.className = "menuImg";

  menuCards.appendChild(img);
}


// navbar toggle 

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");

  


  if (hamburger && navLinks) {
    // Toggle menu open/close
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
      console.log("Hamburger clicked", hamburger.classList.contains('active'));

    });

    // Close nav when clicking a link
    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  } else {
    console.error("Hamburger or navLinks not found in DOM.");
  };


window.addEventListener("DOMContentLoaded", () => {
  showAllMenuImages();
});




