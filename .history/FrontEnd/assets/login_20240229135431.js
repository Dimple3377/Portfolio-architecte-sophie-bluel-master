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
      window.location.href = "index.html";
    } else {
      loginError.textContent = "Informations de connexion incorrectes.";
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    loginError.textContent = "Erreur lors de la tentative de connexion.";
  }


function isLoginPage(){
  return window.location.href.includes("login.html");
 }
// Fonction pour mettre à jour le bouton de connexion/déconnexion
function updateLoginLogoutButton() {
  const loginLogoutButton = document.getElementById("loginLogoutButton"); // Assurez-vous d'avoir un bouton avec cet ID dans votre HTML
  const editModeButton = document.getElementById("editModeButton");
  const categoryButtonsContainer = document.getElementById("buttonFilter");


  
  if (sessionStorage.getItem("token") ) {
    if(loginLogoutButton){
      loginLogoutButton.textContent = "logout";
      loginLogoutButton.removeEventListener("click", handleLoginForm);
      loginLogoutButton.addEventListener("click", handleLogout);
    }
    
    
    editModeButton?.classList.remove("hidden"); // Montre le bouton mode édition
    if(categoryButtonsContainer){
      categoryButtonsContainer.style.display = "none";
    }
  } else {
    if(loginLogoutButton){
      loginLogoutButton.textContent = "login";
      loginLogoutButton.removeEventListener("click", handleLogout);
      loginLogoutButton.addEventListener(
        "click",
        () => (window.location.href = "login.html")
      );
    }

    if(!isLoginPage())
      buttonFilter.style.display = "flex";
    
    editModeButton?.classList?.add("hidden"); // Cache le bouton mode édition
  }
}

// Fonction de déconnexion
function handleLogout() {
  sessionStorage.removeItem("token");
  updateLoginLogoutButton();
  window.location.href = "index.html"; // Redirection vers la page d'accueil ou de connexion
}

// Attacher les fonctions aux événements appropriés une fois le DOM chargé
document.addEventListener("DOMContentLoaded", async () => {
  // Vérification de la connexion de l'utilisateur et mise à jour du bouton de connexion/déconnexion
  updateLoginLogoutButton();
});
// Fonction appelée après une connexion réussie
function postLoginSuccess() {
  document.getElementById("btnModifier").style.display = "block";
  window.location.href = "index.html";
}


 








// Attacher les fonctions aux événements appropriés une fois le DOM chargé
document.addEventListener("DOMContentLoaded", async () => {

  
  if(isLoginPage())
  {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginForm);
    }
  }
  else
  {
// Vérification de la connexion de l'utilisateur
if (sessionStorage.getItem("token")) {

  const btnModifierLoad = document.getElementById("btnModifier");

  if(btnModifierLoad){
    btnModifierLoad.style.display = "block";
  }

  // Ajoutez ici le code pour le bouton "Mode édition"
  const editModeButton = document.getElementById("editModeButton");
  if (editModeButton) {
    editModeButton.classList.remove("hidden"); // S'assurer que le bouton est visible
    editModeButton.addEventListener("click", function () {
      document.body.classList.toggle("editing-mode");
    });
  }
}
  }
 
  
  if(!isLoginPage())
  {
 // Gestionnaire d'événements pour prévisualiser l'image téléchargée
 const realFileUpload = document.getElementById("real-file-upload");
 realFileUpload?.addEventListener("change", previewImage);

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
  }
 
});

