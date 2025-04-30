document.getElementById("quiz-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const age = document.getElementById("age").value;
  const subject = document.getElementById("subject").value;

  const res = await fetch("/.netlify/functions/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ age, subject }),
  });

  const data = await res.json();

  const resultDiv = document.getElementById("quiz-result");
  const owlImage = document.getElementById("owl-image");
  const clapSound = document.getElementById("clap-sound");
  const failSound = document.getElementById("fail-sound");

  if (data.question) {
    const optionsHtml = data.options.map((opt, index) => `
      <li>
        <button class="option-button" data-answer="${opt}">${opt}</button>
      </li>
    `).join("");

    resultDiv.innerHTML = `
      <h3>${data.question}</h3>
      <ul>${optionsHtml}</ul>
      <p><strong>Difficulty:</strong> ${data.difficulty}</p>
    `;

    document.querySelectorAll(".option-button").forEach(button => {
      button.addEventListener("click", () => {
        const selected = button.dataset.answer;
        const correct = data.answer;

        if (selected === correct) {
          owlImage.src = "images/happy-owl.png";
          clapSound.play();
        } else {
          owlImage.src = "images/sad-owl.png";
          failSound.play();
        }

        owlImage.style.display = "block";
        resultDiv.innerHTML += `<p><strong>Correct Answer:</strong> ${correct}</p>`;
      });
    });
  } else {
    resultDiv.textContent = "Error generating quiz.";
  }
});
