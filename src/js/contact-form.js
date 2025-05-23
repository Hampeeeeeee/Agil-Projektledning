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

    const messageText = document.createElement("h4");
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

async function postMessage(newMessage) {
    const response = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
    });

    if (!response.ok) {
        throw new Error("Failed to post message");
    }
    return response.json();
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        const newMessage = {
            name,
            email,
            text: message,
            timestamp: new Date().toISOString(),
        };

        postMessage(newMessage)
            .then(() => {
                contactForm.reset();
                alert("Message sent successfully!");
            })
            .catch((error) => {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again later.");
            });
    });
}
