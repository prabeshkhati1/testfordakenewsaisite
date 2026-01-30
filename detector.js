function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const input = document.getElementById("newsInput");
  input.value = "⏳ Extracting text from image...";

  Tesseract.recognize(
    file,
    "eng",
    {
      logger: m => console.log(m)
    }
  )
    .then(({ data }) => {
      const text = data.text.trim();
      input.value = text || "❌ No readable text found.";
    })
    .catch(err => {
      console.error(err);
      input.value = "❌ OCR failed.";
    });
}

async function sendMessage() {
  const input = document.getElementById("newsInput");
  const text = input.value.trim();
  if (!text) return;

  const chatArea = document.getElementById("chatArea");

  chatArea.innerHTML += `
    <div class="message user">${text}</div>
    <div class="message bot">⏳ Analyzing news...</div>
  `;

  input.value = ""; // ✅ CLEAR INPUT (ONLY CHANGE)

  try {
    const response = await fetch(
      "https://fake-news-backend-w7p0.onrender.com/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      }
    );

    const data = await response.json();

    chatArea.lastElementChild.remove();

    if (data.result === "Input too short for reliable prediction") {
      chatArea.innerHTML += `
        <div class="message bot">
          ⚠️ Please enter a longer news article (at least 20–30 words).
        </div>
      `;
      return;
    }

   chatArea.innerHTML += `
  <div class="message bot" style="margin-top: 16px;">
    🧠 <strong>Result:</strong> ${data.result}<br>
    📊 <strong>Confidence:</strong> ${data.confidence}%
  </div>
`;

  } catch (error) {
    console.error(error);
    chatArea.lastElementChild.remove();
    chatArea.innerHTML += `
      <div class="message bot">
        ❌ Backend not reachable. Is the server running?
      </div>
    `;
  }
}

function clearChat() {
  document.getElementById("chatArea").innerHTML = "";
}
