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
  // Ajout des catégories au select de la modale d'ajout de photos
  const categoriePhotoSelect = document.getElementById("categoriePhoto");
  categoriePhotoSelect.innerHTML = ""; // Vider les options existantes

  // Ajouter une option par défaut (facultatif)
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choisir une catégorie";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categoriePhotoSelect.appendChild(defaultOption);

  // Remplir avec les catégories chargées
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id; // Supposons que chaque catégorie a un champ 'id'
    option.textContent = category.name; // Et un champ 'name'
    categoriePhotoSelect.appendChild(option);
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
    // Ajout du bouton de suppression
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Supprimer";
    deleteButton.onclick = () => confirmDelete(work.id, workFigure);

    workFigure.appendChild(workImage);
    workFigure.appendChild(workCaption);
    workFigure.appendChild(deleteButton); // Ajouter le bouton à la figure
    gallery.appendChild(workFigure);
  });
}

function confirmDelete(workId, workElement) {
  // Afficher la modale de suppression et attacher l'événement de suppression
  const confirmDeleteButton = document.getElementById("confirmDelete");
  confirmDeleteButton.onclick = () => deleteWork(workId, workElement);
  // Afficher la modale
  document.getElementById("modalSuppression").style.display = "block";
}
async function deleteWork(workId, workElement) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });

    if (response.ok) {
      workElement.remove(); // Supprimer l'élément du DOM
    } else {
      console.error("Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
  }
}

async function handlePhotoSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  // Simple validation example
  if (!formData.get("photoUpload") || !formData.get("titrePhoto")) {
    alert("Veuillez remplir tous les champs nécessaires.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData, // Do not set Content-Type header when using FormData
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });

    if (response.ok) {
      const newWork = await response.json();
      works.push(newWork); // Ajouter au tableau local
      displayWork(); // Actualiser la galerie
      showGalleryContent(); // Afficher la galerie et cacher le formulaire
    } else {
      const error = await response.json();
      alert(`Erreur lors de l'ajout : ${error.message}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
    alert("Erreur lors de la connexion à l'API.");
  }
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

    // Ajout du bouton de suppression
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Supprimer";
    deleteButton.onclick = () => confirmDelete(work.id, workFigure);

    workFigure.appendChild(workImage);
    workFigure.appendChild(workCaption);
    modalGallery.appendChild(workFigure);
  });
}

// Fonction pour initialiser la modale de gestion des photos
function initializeModal() {
  const modalAjoutPhoto = document.getElementById("modalAjoutPhoto");
  const btnModifier = document.getElementById("btnModifier");
  const btnOpenAddPhoto = document.getElementById("btnOpenAddPhoto");
  const btnBackToGallery = document.getElementById("btnBackToGallery");
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
  // Ajouter l'écouteur d'événements pour le formulaire d'ajout de photos
  const formAjoutPhoto = document.getElementById("formAjoutPhoto");
  if (formAjoutPhoto) {
    formAjoutPhoto.addEventListener("submit", handlePhotoSubmit);
  }
});
