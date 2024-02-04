// Variables pour stocker les données des travaux et catégories
let works = [];
let categories = [];

// Fonction asynchrone pour gérer la soumission du formulaire de connexion
async function handleLoginForm(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("login-error");

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      sessionStorage.setItem("token", data.token);
      window.location.href = "http://127.0.0.1:5500/FrontEnd/index.html";
      //document.getElementById("btnModifier").style.display = "block";
    } else {
      loginError.textContent = "Informations de connexion incorrectes.";
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    loginError.textContent = "Erreur lors de la tentative de connexion.";
  }
}
// Fonction appelée après une connexion réussie
function postLoginSuccess() {
  document.getElementById("btnModifier").style.display = "block";
  window.location.href = "http://127.0.0.1:5500/FrontEnd/index.html";
}
// Fonction asynchrone pour charger les travaux depuis l'API
async function loadWork() {
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });

    works = await response.json();
    console.log("Travaux chargés:", works);
    displayWork();
  } catch (error) {
    console.error("Erreur lors du chargement des travaux:", error);
  }
}

// Fonction asynchrone pour charger les catégories depuis l'API
async function loadCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories", {
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });

    categories = await response.json();
    console.log("Catégories chargées:", categories);
    displayCategories();
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  }
}
// Fonction pour afficher le contenu de la galerie dans la modale
function showGalleryContent() {
  document.getElementById("galleryContent").style.display = "block";
  document.getElementById("addPhotoContent").style.display = "none";
}

// Fonction pour afficher le formulaire d'ajout de photo dans la modale
function showAddPhotoContent() {
  document.getElementById("galleryContent").style.display = "none";
  document.getElementById("addPhotoContent").style.display = "block";
}
// Fonction pour afficher les catégories dans l'interface utilisateur
function displayCategories() {
  const buttonFilter = document.getElementById("buttonFilter");
  buttonFilter.innerHTML = ""; // Réinitialiser les boutons de filtre

  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.classList.add("button-category", "active");
  allButton.addEventListener("click", () => {
    displayWork();
    setActiveButton(allButton);
  });
  buttonFilter.appendChild(allButton);

  categories.forEach((category) => {
    const categoryButton = document.createElement("button");
    categoryButton.textContent = category.name;
    categoryButton.classList.add("button-category");
    categoryButton.addEventListener("click", () => {
      displayWork(category.id);
      setActiveButton(categoryButton);
    });
    buttonFilter.appendChild(categoryButton);
  });
}

// Fonction pour mettre en évidence le bouton actif
function setActiveButton(activeButton) {
  const buttons = document.querySelectorAll("#buttonFilter .button-category");
  buttons.forEach((button) => button.classList.remove("active"));
  activeButton.classList.add("active");
}

// Fonction pour afficher les travaux dans l'interface utilisateur
function displayWork(categoryId = null) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const filteredWorks = categoryId
    ? works.filter((work) => work.categoryId === categoryId)
    : works;

  filteredWorks.forEach((work) => {
    const workFigure = document.createElement("figure");
    const workImage = document.createElement("img");
    workImage.src = work.imageUrl;
    const workCaption = document.createElement("figcaption");
    workCaption.textContent = work.title;

    workFigure.appendChild(workImage);
    workFigure.appendChild(workCaption);
    gallery.appendChild(workFigure);
  });
}
// Nouvelle fonction pour afficher les travaux dans la modale
function displayWorkInModal() {
  const modalGallery = document.getElementById("modalGallery");
  if (!modalGallery) return;

  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const workFigure = document.createElement("figure");
    const workImage = document.createElement("img");
    workImage.src = work.imageUrl;
    const workCaption = document.createElement("figcaption");
    workCaption.textContent = work.title;

    workFigure.appendChild(workImage);
    workFigure.appendChild(workCaption);
    modalGallery.appendChild(workFigure);
  });
}

// Fonction pour initialiser la modale de gestion des photos
function initializeModal() {
  const modalAjoutPhoto = document.getElementById("modalAjoutPhoto");
  const btnModifier = document.getElementById("btnModifier");
  const btnOpenAddPhoto = document.getElementById("btnOpenAddPhoto"); // Assurez-vous que cet ID correspond à votre bouton "Ajouter une photo"
  const btnBackToGallery = document.getElementById("btnBackToGallery"); // Le bouton de retour dans votre contenu d'ajout de photo
  const closeSpan = modalAjoutPhoto.querySelector(".close");

  btnModifier.addEventListener("click", () => {
    displayWorkInModal(); // Appel de la nouvelle fonction pour afficher les travaux dans la modale
    showGalleryContent();
    modalAjoutPhoto.style.display = "block";
  });

  btnOpenAddPhoto.addEventListener("click", () => {
    showAddPhotoContent();
  });

  btnBackToGallery.addEventListener("click", () => {
    showGalleryContent();
  });

  closeSpan.addEventListener("click", () => {
    modalAjoutPhoto.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalAjoutPhoto) {
      modalAjoutPhoto.style.display = "none";
    }
  });
}

// Attacher les fonctions aux événements appropriés une fois le DOM chargé
document.addEventListener("DOMContentLoaded", async () => {
  // Vérification de la connexion de l'utilisateur
  if (sessionStorage.getItem("token")) {
    document.getElementById("btnModifier").style.display = "block";
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
  }

  await loadCategories();
  await loadWork();
  initializeModal();
});
