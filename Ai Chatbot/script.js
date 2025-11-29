let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

async function fetchData(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let RequestOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key":"YOUR_API_KEY"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: user.message },
            ...(user.file.data
              ? [{
                inlineData: {
                  mimeType: user.file.mime_type,
                  data: user.file.data
                }
              }]
              : [])
          ]
        }
      ]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    let apiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim() ||
      "No response received.";

    text.innerHTML = apiResponse;

  } catch (error) {
    console.log("Fetch error:", error);
    text.innerHTML = " Error fetching response.";
  } finally {
    user.file = { mime_type: null, data: null };
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth"
    });
    image.src = `images/img.svg`
    image.classList.remove("choose")
    user.file = {}
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(userMessage) {
  user.message = userMessage;

  let html = `
    <img src="images/user-image.jpg" width="50">
    <div class="user-chat-area">
      ${user.message}
      ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>
  `;
  prompt.value = "";

  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });

  setTimeout(() => {
    let html = `
      <img src="images/ai-image.jpg" width="50">
      <div class="ai-chat-area">
        <img src="images/loading.webp" class="load" width="50px">
      </div>
    `;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);

    fetchData(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handlechatResponse(prompt.value);
  }
});
submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
})

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string
    };
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imagebtn.querySelector("input").click();
});

