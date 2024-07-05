import config from '../config.js'

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password')
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}
document.getElementById('toggle-password').addEventListener("click", togglePasswordVisibility)

// Function to submit the login form data
document.getElementById('login-form').addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${config.BACKEND_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const result = await response.json();

    if (response.ok) {
    localStorage.setItem("token", result.token)
    localStorage.setItem("user", JSON.stringify(result.user))
    window.location.href = '../home/home.html'
    } else {
        alert(`Error: ${result.message}`);
    }
})
