function togglePasswordVisibility(inputId, toggleIconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleIconId)
    console.log(toggleIcon)
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
    console.log(formData)
    const username = formData.get('username');
    const email = formData.get('email');
    const phone = formData.get('phone')
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const response = await fetch('http://localhost:4000/chatApp/signup', {
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
        alert(result.message);
    } else {
        alert(`Error: ${result.message}`);
    }
})
