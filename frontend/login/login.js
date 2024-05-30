// Function to toggle password visibility
function togglePasswordVisibility(id) {
    const passwordInput = document.getElementById(id);
    const toggleIcon = document.getElementById('toggle-password')
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Function to submit the login form data
async function submitLoginForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:4000/chatApp/login', {
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
        alert(result.message);
    } else {
        alert(`Error: ${result.message}`);
    }
}
