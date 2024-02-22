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
      document.getElementById("btnModifier").style.display = "block";
    } else {
      loginError.textContent = "Informations de connexion incorrectes.";
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    loginError.textContent = "Erreur lors de la tentative de connexion.";
  }
}

// Chargement initial des travaux et catégories
async function loadInitialData() {
  await loadCategories();
  await loadWork();
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

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des travaux");
    }

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
// Modification: Ajout des gestionnaires d'événements pour annuler et fermer la modale
function setupModalEventListeners() {
  const cancelDeleteButton = document.getElementById("cancelDelete");
  const closeButtons = document.querySelectorAll(".modal .close");

  // Gestionnaire pour le bouton d'annulation de suppression
  if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener("click", () => {
      document.getElementById("modalSuppression").style.display = "none";
    });
  }

  // Gestionnaire pour tous les boutons de fermeture des modales
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".modal").style.display = "none";
    });
  });

  // Fermer la modale si on clique en dehors de celle-ci
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  });
}
// Fonction pour afficher le contenu de la galerie dans la modale
function showGalleryContent() {
  document.getElementById("modalGallery").style.display = "grid";
  document.getElementById("addPhotoContent").style.display = "none";
}

// Fonction pour afficher le formulaire d'ajout de photo dans la modale
function showAddPhotoContent() {
  document.getElementById("modalGallery").style.display = "none";
  document.getElementById("addPhotoContent").style.display = "block";
}

// Fonction pour prévisualiser l'image
function previewImage(event) {
  const output = document.getElementById("imagePreview");
  output.src = URL.createObjectURL(event.target.files[0]);
  output.onload = function () {
    URL.revokeObjectURL(output.src); // Libérer la mémoire
  };
  output.style.display = "block";
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

  // Ajouter une option par défaut
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

    workFigure.appendChild(workImage);
    workFigure.appendChild(workCaption);

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
      // Supprime l'élément du tableau `works` en utilisant `filter` pour ne garder que les éléments dont l'ID est différent
      works = works.filter((work) => work.id !== workId);
      workElement.remove(); // Supprimer l'élément du DOM
      await loadWork();
      displayWork();
    } else {
      console.error("Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
  }
}

async function handlePhotoSubmit(event) {
  event.preventDefault();
  const formData = new FormData();
  const titlePhotoValue = document.getElementById("titrePhoto").value;
  const categoriePhotoValue = document.getElementById("categoriePhoto").value;
  const photoUpload = document.getElementById("real-file-upload").files[0];

  //exemple
  if (!photoUpload || !titlePhotoValue) {
    alert("Veuillez remplir tous les champs nécessaires.");
    return;
  }

  formData.append("title", titlePhotoValue);
  formData.append("category", categoriePhotoValue);
  formData.append("image", photoUpload);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
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
    workFigure.className = "work-item"; // Classe pour le style CSS
    const workImage = document.createElement("img");
    workImage.src = work.imageUrl;
    workImage.alt = work.title; // Ajouter un alt text pour l'accessibilité
    const workCaption = document.createElement("figcaption");
    workCaption.textContent = work.title;

    // Création de l'icône de suppression directement dans le HTML
    const trashIcon = document.createElement("i");
    trashIcon.className = "fas fa-trash-alt trash-icon";
    trashIcon.onclick = () => confirmDelete(work.id, workFigure);

    workFigure.appendChild(trashIcon);
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

  function adjustLoginLogoutButton() {
    const loginLogoutButton = document.getElementById("loginLogoutButton"); // Assurez-vous que cet ID est correct
    // Vérifiez si l'élément existe pour éviter les erreurs
    if (loginLogoutButton) {
      if (sessionStorage.getItem("token")) {
        loginLogoutButton.textContent = "Logout";
        loginLogoutButton.href = "#";
        loginLogoutButton.onclick = function (event) {
          event.preventDefault();
          sessionStorage.removeItem("token");
          adjustLoginLogoutButton(); // Mettez à jour le bouton après la déconnexion
          window.location.href = "index.html"; // Redirigez ou actualisez la page comme nécessaire
        };
      } else {
        loginLogoutButton.textContent = "Login";
        loginLogoutButton.href = "login.html";
        loginLogoutButton.onclick = null; // Enlever le gestionnaire d'événement précédent s'il existe
      }
    }
  }

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
  adjustLoginLogoutButton();
  // Vérification de la connexion de l'utilisateur
  if (sessionStorage.getItem("token")) {
    document.getElementById("btnModifier").style.display = "block";
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
  }

  // Gestionnaire d'événements pour le bouton d'ajout de photo qui ouvre le sélecteur de fichier
  const btnUpload = document.querySelector(".btn-upload");
  if (btnUpload) {
    btnUpload.addEventListener("click", function () {
      document.getElementById("real-file-upload").click();
    });
  }

  const btnOpenAddPhoto = document.getElementById("btnOpenAddPhoto");
  if (btnOpenAddPhoto) {
    btnOpenAddPhoto.addEventListener("click", function () {
      this.style.display = "none"; // Cache le bouton après le clic
      // Trouve le séparateur et le bouton Valider
      const separator = document.querySelector(".separator");
      const btnValider = document.getElementById("btnValider");

      // Déplace le séparateur pour qu'il soit juste au-dessus du bouton Valider
      if (btnValider && separator) {
        btnValider.parentNode.insertBefore(separator, btnValider);
      }
      showAddPhotoContent(); // Fonction pour afficher le formulaire d'ajout de photo
    });
  }
  // Gestionnaire d'événements pour retourner à la galerie depuis le formulaire d'ajout de photo
  const btnBackToGallery = document.getElementById("btnBackToGallery");
  if (btnBackToGallery) {
    btnBackToGallery.addEventListener("click", function () {
      const btnOpenAddPhoto = document.getElementById("btnOpenAddPhoto");
      if (btnOpenAddPhoto) {
        btnOpenAddPhoto.style.display = "block"; // Rend le bouton à nouveau visible
      }
      showGalleryContent(); // Supposé montrer à nouveau le contenu de la galerie
    });
  }

  // Gestionnaire d'événements pour prévisualiser l'image téléchargée
  const realFileUpload = document.getElementById("real-file-upload");
  realFileUpload.addEventListener("change", previewImage);

  const formAjoutPhoto = document.getElementById("formAjoutPhoto");
  if (formAjoutPhoto) {
    formAjoutPhoto.addEventListener("submit", handlePhotoSubmit);
  }
  // Chargement des catégories et des travaux initiaux
  await loadCategories();
  await loadWork();

  // Initialisation des modales et des écouteurs d'événements
  initializeModal();
  setupModalEventListeners(); // Ajout de cette ligne pour initialiser les écouteurs d'événements de la modale
});
