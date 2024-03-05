// Fonction pour vérifier si l'utilisateur est sur la page de connexion
function isLoginPage() {
  return window.location.href.includes("login.html");
}

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
      // Redirection conditionnelle basée sur la page actuelle
      if (isLoginPage()) {
        window.location.href = "index.html";
      }
    } else {
      loginError.textContent = "Informations de connexion incorrectes.";
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    loginError.textContent = "Erreur lors de la tentative de connexion.";
  }
}

// Attacher la fonction handleLoginForm à l'événement de soumission du formulaire une fois le DOM chargé
document.addEventListener("DOMContentLoaded", () => {
  // Exécute certaines logiques uniquement si l'utilisateur est sur la page de connexion
  if (isLoginPage()) {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginForm);
    }
  }
});
