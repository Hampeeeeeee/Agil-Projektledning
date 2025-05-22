import { API_BASE } from "../main.js";

async function fetchMessages() {
    const response = await fetch(`${API_BASE}/messages`);
    if (!response.ok) {
        throw new Error("Failed to fetch messages");
    }
    return response.json();
}

function createMessageCard(newMessage) {
    const card = document.createElement("div");
    card.className = "message-card";

    const name = document.createElement("h3");
    name.textContent = newMessage.name;
    card.appendChild(name);

    const timestamp = document.createElement("p");
    timestamp.textContent = `Sent: ${new Date(
        newMessage.timestamp
    ).toLocaleString()}`;
    card.appendChild(timestamp);

    const email = document.createElement("p");
    email.textContent = `Email: ${newMessage.email}`;
    card.appendChild(email);

    const messageText = document.createElement("p");
    messageText.textContent = `Message: ${newMessage.text}`;
    card.appendChild(messageText);

    return card;
}

document.addEventListener("DOMContentLoaded", () => {
    const messagesContainer = document.getElementById("admin-messages");
    if (!messagesContainer) return;

    fetchMessages()
        .then((newMessages) => {
            newMessages.forEach((newMessage) => {
                const card = createMessageCard(newMessage);
                messagesContainer.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error loading messages:", error);
            messagesContainer.innerHTML = "<p>Failed to load messages.</p>";
        });
});
