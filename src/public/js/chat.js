const socket = io();
const messages = document.getElementById("messages");
let allMessages = [];

socket.on("messages", (data) => {
  allMessages = data;
  updateMessageDisplay();
});

const sendMessage = () => {
  const user = document.getElementById("user");
  const message = document.getElementById("message");

  const newMessage = { user: user.value, message: message.value };

  socket.emit("newMessage", newMessage);
  allMessages.push(newMessage);
  updateMessageDisplay();

  user.value = "";
  message.value = "";
};

function updateMessageDisplay() {
  let salida = ``;

  allMessages.forEach((item) => {
    salida += `<p class="card-text"><b>${item.user}:</b> <span class="fw-light">${item.message}</span></p>`;
  });

  messages.innerHTML = salida;
}

const btnSendMessage = document.getElementById("btnSendMessage");
btnSendMessage.onclick = sendMessage;
