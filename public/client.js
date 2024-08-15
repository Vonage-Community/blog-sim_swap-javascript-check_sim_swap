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
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error during data request to ${endpoint}:`, errorData);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error during data request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = userInput.value.trim();
      const password = passwordInput.value.trim();

      try {
        const simCheckResponse = await sendData("/simswap", { username });
        if (simCheckResponse.swapped) {
          showModal(); // Show warning modal if SIM swapped
        } else {
          // If not swapped, proceed with login
          const loginResponse = await sendData("/login", {
            username,
            password,
          });
          if (loginResponse.message !== "Success") {
            alert("Invalid username or password.");
          } else {
            window.location.href = "/main";
          }
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Login process failed.");
      }
    });
  }
});
