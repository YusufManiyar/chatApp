

const token = localStorage.getItem('token')

let selectedUser
let messages=''

document.getElementById('send-button').addEventListener('click', async () => {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message.trim() && selectedUser) {
        appendMessage(message, 'sent');

        // Send message to backend API
        try {
            await fetch('http://localhost:4000/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId: selectedUser.id, message })
            });
        } catch (error) {
            console.error('Failed to send message', error);
        }

        messageInput.value = '';
    }
});

// socket.on('receiveMessage', ({ message, from, to }) => {
//     if (from === selectedUser.id && to === currentUser.id) {
//         appendMessage(message, 'received');
//     }
// });
// chat-messages - center
// message -

function appendMessage(message, type) {
    const messageContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerText = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

document.getElementById('search-input').addEventListener('input', filterUsers);

function filterUsers() {
    const filter = document.getElementById('search-input').value.toLowerCase();
    const userList = document.getElementById('user-list');
    const users = userList.getElementsByTagName('li');
    Array.from(users).forEach(user => {
        const phone = user.getAttribute('data-phone');
        if (phone.toLowerCase().includes(filter)) {
            user.style.display = '';
        } else {
            user.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Mock user list for demonstration

    try {
       const response =  await fetch('http://localhost:4000/user/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const users = await response.json()
        console.log(users)
    const userList = document.getElementById('user-list');
    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.innerText = user.username;
        userElement.id = user.id
        userElement.setAttribute('data-phone', user.phone);
        userElement.addEventListener('click', () => selectUser(user));
        userList.appendChild(userElement);
    });

} catch (error) {
    console.error('Failed to get users', error);
}
});

function selectUser(user) {
    selectedUser = user;
    const chatHeader = document.getElementById('chat-header-title')
    chatHeader.innerText = `Chatting with ${user.username}`;
    chatHeader.setAttribute('userId', user.id)    
    document.getElementById('chat-messages').innerHTML = ''; // Clear previous messages
    fetchMessages()
}


async function fetchMessages() {
    if (selectedUser) {
        const response = await fetch(`http://localhost:4000/message?id=${encodeURIComponent(selectedUser.id)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const messages = await response.json()
        const messageContainer = document.getElementById('chat-messages');
        messageContainer.innerHTML=''
        messages.forEach(message => {
            let type = selectedUser.id === message.receiverId ? 'recieved': 'sent'
            appendMessage(message.message, type)
        })
    }
}

// Mock receiving messages for demonstration
setInterval(fetchMessages, 1000);
