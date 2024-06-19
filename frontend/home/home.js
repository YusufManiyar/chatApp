

const token = localStorage.getItem('token')
const currentUser = localStorage.getItem('user')
if(!token) {
    localStorage.clear()
    window.location.href = '../login/login.html'
}


let selectedChat
let messages=''
let lastMessageId

document.getElementById('send-button').addEventListener('click', async () => {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message.trim() && selectedChat) {
        // Send message to backend API
        try {
            await fetch('http://localhost:4000/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId: selectedChat.id, message })
            });
        } catch (error) {
            console.error('Failed to send message', error);
        }

        messageInput.value = '';
    }
});

function toggleColor(element) {
    element.classList.toggle('clicked');
  }

function appendMessage(message, type) {
    const messageContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerText = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showChat(group) {
    console.log(group)
    const userList = document.getElementById('group-list');
    const userElement = document.createElement('li');
    userElement.innerText = group.name;
    userElement.id = group.id
    userElement.addEventListener('click', () => selectChat(group));
    userList.appendChild(userElement);

}

document.getElementById('search-input').addEventListener('input', filterGroups);

function filterGroups() {
    const filter = document.getElementById('search-input').value.toLowerCase();
    const groupList = document.getElementById('group-list');
    const groups = groupList.getElementsByTagName('li');
    Array.from(groups).forEach(group => {
        if (group.textContent.toLowerCase().includes(filter)) {
            group.style.display = '';
        } else {
            group.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Mock user list for demonstration

    try {
       const response =  await fetch('http://localhost:4000/group', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json()
        data.forEach(el => {
            showChat(el.group)
        });

} catch (error) {
    console.error('Failed to get users', error);
}

const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

// Toggle the dropdown menu visibility
dropdownToggle.addEventListener('click',async () => {
    const isMenuVisible = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isMenuVisible ? 'none' : 'block';
    if(!isMenuVisible){
        const response =  await fetch('http://localhost:4000/user/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const users = await response.json()
        
        const userList = document.getElementById('user-list')
        userList.replaceChildren();

        users.forEach(user => {
            const userElement = document.createElement('li');
            userElement.innerText = user.username;
            userElement.id = user.id
            userList.appendChild(userElement);
        });
        userList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                toggleColor(event.target);
              }
          });
    }
});

// Hide dropdown menu when clicking outside of it
document.addEventListener('click', (event) => {
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Update the button text based on selected checkboxes
const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateButtonLabel);
});

function updateButtonLabel() {
    const selected = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });

}


});

function selectChat(group) {
    selectedChat = group;
    let messageData = localStorage.getItem(selectedChat.name)
    messageData = messageData ? JSON.parse(messageData) : { messages : [], lastMessageId: undefined}
    lastMessageId = messageData.lastMessageId

    const chatHeader = document.getElementById('chat-header-title')
    chatHeader.innerText = `Chatting with ${group.name}`;
    chatHeader.setAttribute('groupId', group.id)    
    document.getElementById('chat-messages').innerHTML = ''; // Clear previous messages

    messageData.messages.forEach(message => {
        let type = currentUser == message.senderId ? 'sent' : 'recieved'
        appendMessage(message.message, type)
    })

    fetchMessages()
}


async function fetchMessages() {
    if (selectedChat) {
        let fetchMessageLimit = 2
        let queryParams = ''
        queryParams += `id=${encodeURIComponent(selectedChat.id)}`
        queryParams += lastMessageId ? `&skip=${encodeURIComponent(lastMessageId)}` : ''
        queryParams += `&limit=${encodeURIComponent(fetchMessageLimit)}`

        const response = await fetch(`http://localhost:4000/message?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const messages = await response.json()

        console.log('Messages', currentUser, messages)
        if(messages && messages.length > 0) {
            lastMessageId = messages[messages.length-1].id
            let messageData = localStorage.getItem(selectedChat.name)
            messageData = messageData ? JSON.parse(messageData) : { messages : [], lastMessageId: undefined}
            messageData.messages = messageData.messages.concat(messages)
            messageData.lastMessageId = lastMessageId

            localStorage.setItem(selectedChat.name, JSON.stringify(messageData))

            messages.forEach(message => {
                let type = currentUser == message.senderId ? 'sent' : 'recieved'
                appendMessage(message.message, type)
            })
        }
    }
}

// Mock receiving messages for demonstration
// setInterval(fetchMessages, 3000);



document.addEventListener('DOMContentLoaded', () => {
    const createGroupButton = document.getElementById('create-group-button');
    const createGroupModal = document.getElementById('create-group-modal');
    const addMemberButton = document.getElementById('add-member-button');
    const addMemberModal = document.getElementById('add-member-modal');

    // Get the <span> element that closes the modal
    const closeButtons = document.querySelectorAll('.close');

    // Open the Create Group Modal
    createGroupButton.onclick = () => {
        createGroupModal.style.display = 'block';
    };

    // Open the Add Member Modal
    addMemberButton.onclick = () => {
        addMemberModal.style.display = 'block';
    };

    // Close the modals
    closeButtons.forEach(btn => {
        btn.onclick = () => {
            createGroupModal.style.display = 'none';
            addMemberModal.style.display = 'none';
        };
    });

    const name = document.getElementById('group-name-input')

    // Create Group Submit
    document.getElementById('create-group-submit').onclick = async () => {
        const name = document.getElementById('group-name-input').value;
        const userList = document.getElementById('user-list')
        let memberIds = []
        userList.childNodes.forEach(user => {
            if(user.className === 'clicked'){
                memberIds.push(user.id)
            }
        })

        if(name !== ""){
            const response = await fetch('http://localhost:4000/group',{
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name,memberIds })
                });
    
                const data = await response.json()
                showChat(data)
        } else {
            alert('Please Enter Topic or Chat Name')
            return 
        }
        // Call your API to create the group with groupName and members
        // Example: createGroupAPI(groupName, members);


        createGroupModal.style.display = 'none';
    };

   

    // Add Member Submit
    document.getElementById('add-member-submit').onclick = () => {
        const members = document.getElementById('add-member-input').value.split(',');

        // Call your API to add members to the group
        // Example: addMembersAPI(currentGroupId, members);

        addMemberModal.style.display = 'none';
    };

    // Function to show/hide the add member button based on group chat
    function toggleAddMemberButton(isGroupChat) {
        addMemberButton.style.display = isGroupChat ? 'block' : 'none';
    }

    // Example function to load chat
    function loadChat(groupId) {
        // Load chat messages and details
        toggleAddMemberButton(true); // Show add member button for group chats
    }

    // Hide the add member button initially
    toggleAddMemberButton(false);
});
