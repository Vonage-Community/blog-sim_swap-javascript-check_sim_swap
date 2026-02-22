document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const userInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const swappedModal = document.getElementById("modalSwapped");

  // Function to show modal
  function showModal() {
    swappedModal.style.display = "block";
  }

  // Function to send data to the server
  async function sendData(endpoint, data) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      // Attach the parsed body so the caller can inspect the message
      const error = new Error(`HTTP error! Status: ${response.status}`);
      error.data = json;
      throw error;
    }

    return json;
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = userInput.value.trim();
      const password = passwordInput.value.trim();

      try {
        const loginResponse = await sendData("/login", { username, password });
        if (loginResponse.message === "Success") {
          window.location.href = "/main";
        }
      } catch (error) {
        if (error.data?.message === "SIM Swapped") {
          showModal(); // Show warning modal if SIM swapped
        } else {
          console.error("Error during login:", error);
          alert("Invalid username or password.");
        }
      }
    });
  }
});