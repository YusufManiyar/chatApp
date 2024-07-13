import config from '../config.js'

// check user details
const token = localStorage.getItem('token')
const currentUser = JSON.parse(localStorage.getItem('user'))
if(!token) {
    localStorage.clear()
    window.location.href = '../login/login.html'
}

let socket = new WebSocket(`ws://${config.BACKEND_BASE_URL}/token=${token}`)

socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
});

socket.addEventListener('close', () => {
    console.log('WebSocket connection close');
    socket = new WebSocket(`ws://${config.BACKEND_BASE_URL}/token=${token}`)
});

socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);

    const data = JSON.parse(event.data)
    let messageData = localStorage.getItem(`group ${data.recieverId}`)
    messageData = messageData ? JSON.parse(messageData) : { messages : [], lastMessageId: undefined}
    messageData.messages = messageData.messages.concat([data])
    localStorage.setItem(`group ${data.recieverId}`, JSON.stringify(messageData))

    let type = currentUser.id == data.senderId ? 'sent' : 'recieved'
    appendMessage(data, type)
});

// logout button
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../login/login.html'
})

// Greeting to user
const user = document.getElementById('userName')
user.textContent = `Welcome ${currentUser.username}`

// search by group
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
document.getElementById('search-input').addEventListener('input', filterGroups);

// Create Group modal
const createGroupButton = document.getElementById('create-group-button');
const createGroupModal = document.getElementById('create-group-modal');

// Open the Create Group Modal
createGroupButton.onclick = () => {
    createGroupModal.style.display = 'block';
};

// Close the modals
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(btn => {
    btn.onclick = () => {
        createGroupModal.style.display = 'none';
        addMemberModal.style.display = 'none';
    };
});

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
            const response = await fetch(`http://${config.BACKEND_BASE_URL}/group`,{
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name,memberIds })
                });

                const data = await response.json()
                showGroup(data, 'admin')
        } else {
            alert('Please Enter Topic or Chat Name')
            return 
        }

        createGroupModal.style.display = 'none';
};

function toggleColor(element) {
    element.classList.toggle('clicked');
}

const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

// Toggle the dropdown menu visibility
dropdownToggle.addEventListener('click',async () => {
    const isMenuVisible = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isMenuVisible ? 'none' : 'block';
    if(!isMenuVisible){
        const users = await getUsers()
        
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

async function getUsers(groupId){

    const response =  await fetch(`http://${config.BACKEND_BASE_URL}/user/users?${groupId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return  await response.json()
}

// Hide dropdown menu when clicking outside of it
document.addEventListener('click', (event) => {
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// show groups
function showGroup(group, role) {
    const groupList = document.getElementById('group-list');
    const groupElement = document.createElement('li');
    groupElement.innerText = group.name;
    // groupElement.id = group.id
    groupElement.addEventListener('click', async () => await selectGroup(group, role));
    groupList.appendChild(groupElement);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch All groups of the user
    try {
       const response =  await fetch(`http://${config.BACKEND_BASE_URL}/group`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json()
        data.forEach(el => {
            // el.group.role = el.role
            showGroup(el.group, el.role)
        });

    } catch (error) {
        console.error('Failed to get users', error);
    }




});

const intervalManager = {
    start(callback, interval) {
      this.intervalId = setInterval(callback, interval);
    },
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
};

async function selectGroup(group, role) {
    // Send Message in a group
    document.getElementById('groupInfo').style.display = 'none'
    document.getElementById('group-detail').style.display = 'flex'
    const fileButton = document.getElementById('file-button');
    const fileInput = document.getElementById('file-input');
    const fileDisplay = document.getElementById('file-display');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileButton = document.getElementById('remove-file-button');

    fileButton.addEventListener('click', () => {
        fileInput.click();
    });

    let file
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileDisplay.style.display = 'block';
        }
    });

    // Handle remove file button click
    removeFileButton.addEventListener('click', () => {
        file = null;
        fileInput.value = '';
        fileDisplay.style.display = 'none';
    });


    document.getElementById('send-button').addEventListener('click', async () => {
        document.getElementById('send-button').disabled = true
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value;
        if ((message.trim() || file) && group) {
            // Send message to backend API
            try {
                const msg = { receiverId: group.id, message}
                sendMessage(message, group.id, file)
                if(file) {
                    file = null;
                    fileInput.value = '';
                    fileDisplay.style.display = 'none';

                }
            } catch (error) {
                console.error('Failed to send message', error);
            }

            messageInput.value = '';
        }
        document.getElementById('send-button').disabled = false
    });

    // stop fetch message event for previously selected group
    intervalManager.stop()

    let messageData = localStorage.getItem(group.name)
    messageData = messageData ? JSON.parse(messageData) : { messages : [], lastMessageId: undefined}

    const chatHeader = document.getElementById('chat-header-title')
    chatHeader.innerText = `Chatting with ${group.name}`;
    chatHeader.setAttribute('groupId', group.id)    
    document.getElementById('add-member-button').style.display = role === 'admin' ? 'block' : 'none'
    document.getElementById('chat-messages').innerHTML = ''; // Clear previous messages

    messageData.messages.forEach(message => {
        let type = currentUser.id == message.senderId ? 'sent' : 'recieved'
        appendMessage(message, type)
    })


    fetchMessages(group, messageData.lastMessageId)
    // intervalManager.start(() => fetchMessages(group, messageData.lastMessageId), 3000);
    
}

document.getElementById('add-member-button').addEventListener('click', async () => {
    let groupId = document.getElementById('chat-header-title').getAttribute('groupId')
    let params = `id=${encodeURIComponent(groupId)}`
    const users = await getUsers(params)
    const groupMembersList = document.getElementById('groupMembersList');
        groupMembersList.innerHTML = ''; // Clear the list
        const groupInfo = document.getElementById('groupInfo')
        groupInfo.style.display = 'flex'
        users.forEach(member => {
            const listItem = document.createElement('li');
            listItem.className = 'member'
            listItem.innerHTML = `<div id='${member.id}' class='add-user'> ${member.username} <img src='../assets/icons8-add-25.png' class='addUser' onClick= addUserToGroup(${member.id}) atl='add user'></div>`; // Assuming user object has a 'name' property
            groupMembersList.appendChild(listItem);
            // var a = document.getElementsByClassName('addUser')
            // console.log(a)
            //element.addEventListener('click', addUserToGroup))
        })
        groupMembersList.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                toggleColor(event.target);
            }
        });

})

async function addUserToGroup(memberId){
    let groupId = document.getElementById('chat-header-title').getAttribute('groupId')
    try{
        const response = await fetch(`http://${config.BACKEND_BASE_URL}/groupMember`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ groupId, memberId })
        });
        
        const data = await response.json()
        if(response.status >= 400) {
            throw data.message
        }

        document.getElementById(memberId).parentElement.remove()
    } catch(error){
        console.log(error)
        alert(error)
    }
}

document.getElementById('group-info').addEventListener('click', async () => {
    document.getElementById('groupInfo').style.display = 'flex'
    let groupId = document.getElementById('chat-header-title').getAttribute('groupId')
    groupId = `id=${encodeURIComponent(groupId)}`
    // let memberData = []
     fetch(`http://${config.BACKEND_BASE_URL}/groupMember?${groupId}`,{
        method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
    })
    .then(response => response.json())
    .then(data => {
        const members = data
        const groupMembersList = document.getElementById('groupMembersList');
        groupMembersList.innerHTML = ''; // Clear the list
        members.forEach(member => {
            const listItem = document.createElement('li');
            // listItem.setAttribute('role', member.role )
            listItem.className = 'member'
            listItem.innerHTML = `<div id='${member.id}'> ${member.user.username} <h6> ${member.role} </h6> </div>`; // Assuming user object has a 'name' property

            groupMembersList.appendChild(listItem);

            document.getElementById(String(member.id)).addEventListener('mousedown', function(e) {

            e.preventDefault()
            if (e.button === 0) { // Check if the right mouse button was clicked
                e.preventDefault(); // Prevent the default right-click menu
          // Check if the right-clicked target is a member item
            // Remove any existing context menu if present
            if(e.target.className !== 'action-menu') {

            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu) {
              contextMenu.remove();
            }

            // Create a new context menu
            const menuOptions = ['Remove', 'Make Admin', 'Close']; // Options for the context menu
            const contextMenuElement = document.createElement('ul');
            contextMenuElement.id = 'contextMenu';
            contextMenuElement.className = 'context-menu';

            // Create list items for each menu option
            menuOptions.forEach(option => {

                if(!(member.role === 'admin' && option === 'Make Admin')) {
                    const menuItem = document.createElement('li');
                    menuItem.className = 'action-menu'
                    menuItem.textContent = option;
                    menuItem.addEventListener('click', function() {
                    // Action based on clicked menu item
                    if (option === 'Remove') {
                        // Handle remove action
                        removeMember(e); // Pass the clicked member element
                    } else if (option === 'Make Admin') {
                        // Handle make admin action
                        makeAdmin(e); // Pass the clicked member element
                    }


                    // Remove the context menu after action
                    contextMenuElement.remove();
                    });
            
                    // Append each menu item to the context menu
                    contextMenuElement.appendChild(menuItem);
                }
            });
        
            // Position the context menu relative to the mouse pointer
            contextMenuElement.style.top = `${e.LayerY}px`;
            contextMenuElement.style.left = `${e.LayerX}px`;

            // Append the context menu to the document body
            listItem.appendChild(contextMenuElement);
        }
        }
    });
    });

    })
    .catch(error => {
    console.error('Error fetching group members:', error);
    });
})

async function fetchMessages(selectedChat) {
    if (selectedChat) {
        let queryParams = ''
        queryParams += `id=${encodeURIComponent(selectedChat.id)}`

        const response = await fetch(`http://${config.BACKEND_BASE_URL}/message?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const messages = await response.json()

        if(messages && messages.length > 0) {
            let messageData = localStorage.getItem(`group ${selectedChat.id}`)
            messageData = messageData ? JSON.parse(messageData) : { messages : [], lastMessageId: undefined}
            messageData.messages = messageData.messages.concat(messages)
            messageData.lastMessageId = messages[messages.length-1].id

            localStorage.setItem(`group ${selectedChat.id}`, JSON.stringify(messageData))

            messages.forEach(message => {
                let type = currentUser.id == message.senderId ? 'sent' : 'recieved'
                appendMessage(message, type)
            })
        }
    }
}

function sendMessage(message, receiverId, file) {
    // Prepare JSON part
    const data = {
      message: message,
      receiverId: receiverId,
      hasFile: !!file
    };
  
    // Convert JSON to Blob
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const arrayBuffer = event.target.result;

          // Combine JSON Blob and File ArrayBuffer
          const combinedBlob = new Blob([jsonBlob, arrayBuffer], { type: 'application/octet-stream' });
          socket.send(combinedBlob);
        }
        reader.readAsArrayBuffer(file);
    }
    else {
        socket.send(jsonBlob)
    }
  
  }  

function appendMessage(data, type) {
    const messageContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerHTML = data.attachment ? `File uploaded: <a href="${data.attachment}" target="_blank">${data.name}</a></br><span>${data.message}</span>` : `<span>${data.message}</span>`
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function removeMember(e) {
        let current = e.target.id.length > 0 ? e.target : e.target.parentElement
        let params = `id=${encodeURIComponent(current.id)}`
        try{
            const response = await fetch(`http://${config.BACKEND_BASE_URL}/groupMember?${params}`,{
                method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
            })

            const res = await response.json()
            if(response.status === 200){
                current.remove()
            }
        } catch(error){
            console.log(error.message)
        }
    // let parent = current.parentElement
    // current.remove()
}

async function makeAdmin(e){
    let current = e.target.id.length > 0 ? e.target : e.target.parentElement
    let params = `id=${encodeURIComponent(current.id)}`
    try{
        const response = await fetch(`http://${config.BACKEND_BASE_URL}/groupMember?${params}`,{
            method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
        })

        const res = await response.json()
        if(response.status === 200){
            current.childNodes[1].innerText = 'admin'
        }
    }catch(error){
        console.log(error)
    }
}


