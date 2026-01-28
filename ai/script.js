let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#imageinput");

const Api_Url = "https://api.groq.com/openai/v1/chat/completions";

let user = { message: null };

// ---------------- IMAGE PREVIEW ----------------

imagebtn.addEventListener("click", () => {
  imageinput.click();
});

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    let html = `
      <img src="images/user-image.jpg">
      <div class="user-chat-area">
        <img src="${reader.result}" class="chat-image">
      </div>
    `;

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTop = chatContainer.scrollHeight;
    imageinput.value = "";
  };

  reader.readAsDataURL(file);
});

// ---------------- CHAT GPT ----------------

async function fetchData(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let RequestOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: user.message }],
      max_tokens: 300
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();
    text.innerHTML = data.choices[0].message.content;
  } catch (error) {
    text.innerHTML = "Network error.";
    console.log(error);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(userMessage) {
  if (!userMessage.trim()) return;

  user.message = userMessage;

  let html = `
    <img src="images/user-image.jpg">
    <div class="user-chat-area">${user.message}</div>
  `;

  prompt.value = "";

  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(() => {
    let html = `
      <img src="images/ai-image.jpg">
      <div class="ai-chat-area">Typing...</div>
    `;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    fetchData(aiChatBox);
  }, 400);
}

// ENTER KEY
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handlechatResponse(prompt.value);
});

// SEND BUTTON
submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
});

