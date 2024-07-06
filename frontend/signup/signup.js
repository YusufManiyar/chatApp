import config from "../config.js";

document.getElementById('password-icon').onclick = () => togglePasswordVisibility('password', 'password-icon')
document.getElementById('confirm-password-icon').onclick = () => togglePasswordVisibility('confirm-password', 'confirm-password-icon')

function togglePasswordVisibility(inputId, toggleIconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleIconId)

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }


    // const passwordType = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    // passwordInput.setAttribute('type', passwordType);
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const phone = formData.get('phone')
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const response = await fetch(`https://${config.BACKEND_BASE_URL}/user/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email,
            phone,
            password,
        })
    });

    const result = await response.json();
    if (response.ok) {
        window.location.href = '../login/login.html'
    } else {
        alert(`Error: ${result.message}`);
    }
})
