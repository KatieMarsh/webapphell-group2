 // ฟังก์ชันเลือกหรือยกเลิกเลือกตัวเลือก
 function toggleOption(button) {
    if (button.classList.contains("selected")) {
      button.classList.remove("selected");
      removeOption(button.textContent);
    } else {
      button.classList.add("selected");
      addOption(button.textContent);
    }
  }

  // ฟังก์ชันเพิ่มตัวเลือกในรายการ
  function addOption(option) {
    const selectedButtons = document.getElementById("selected-buttons");
    const span = document.createElement("span");
    span.textContent = option;
    span.className = "selected-button";
    span.addEventListener("click", () => {
      removeOption(option);
      const optionButtons = document.querySelectorAll(".option-button");
      optionButtons.forEach((button) => {
        if (button.textContent === option) {
          button.classList.remove("selected");
        }
      });
    });
    selectedButtons.appendChild(span);
  }

  // ฟังก์ชันลบตัวเลือกจากรายการ
  function removeOption(option) {
    const selectedButtons = document.getElementById("selected-buttons");
    const selectedButtonSpans = selectedButtons.getElementsByClassName("selected-button");
    for (let i = 0; i < selectedButtonSpans.length; i++) {
      if (selectedButtonSpans[i].textContent === option) {
        selectedButtons.removeChild(selectedButtonSpans[i]);
        break;
      }
    }
  }

  