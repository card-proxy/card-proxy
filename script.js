let selectedImages = new Array(9).fill(null);
let currentSize = { width: 63, height: 88 };

function createCardSlots() {
  const grid = document.getElementById("cardGrid");
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const slot = document.createElement("div");
    slot.className = "card-slot";
    slot.style.width = currentSize.width + "mm";
    slot.style.height = currentSize.height + "mm";

    const img = document.createElement("img");
    if (selectedImages[i]) {
      img.src = selectedImages[i];
      slot.appendChild(img);
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", handleImageUpload);
      slot.appendChild(input);

      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("dragover");
      });

      slot.addEventListener("dragleave", () => {
        slot.classList.remove("dragover");
      });

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement("img");
            img.src = event.target.result;
            slot.innerHTML = "";
            slot.appendChild(img);
            selectedImages[i] = event.target.result;

            if (document.getElementById("applyToAll").checked) {
              selectedImages = new Array(9).fill(event.target.result);
              createCardSlots();
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    grid.appendChild(slot);
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;
    const parent = event.target.parentNode;
    const index = Array.from(document.getElementById("cardGrid").children).indexOf(parent);

    selectedImages[index] = imageUrl;
    if (document.getElementById("applyToAll").checked) {
      selectedImages = new Array(9).fill(imageUrl);
    }
    createCardSlots();
  };
  reader.readAsDataURL(file);
}

function resetImages() {
  selectedImages = new Array(9).fill(null);
  createCardSlots();
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const width = currentSize.width;
  const height = currentSize.height;
  const spacing = 5;
  const pageWidth = 210;
  const pageHeight = 297;
  const totalCardWidth = width * 3 + spacing * 2;
  const startX = (pageWidth - totalCardWidth) / 2;
  const startY = 10;

  const pageCount = parseInt(document.getElementById("pageCountSelector").value);

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) doc.addPage();
    for (let i = 0; i < 9; i++) {
      if (!selectedImages[i]) continue;
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * (width + spacing);
      const y = startY + row * (height + spacing);
      try {
        doc.addImage(selectedImages[i], "PNG", x, y, width, height);
      } catch (e) {
        console.error("PDF描画エラー:", e);
      }
    }
  }
  doc.save("cards.pdf");
}

document.getElementById("sizeSelector").addEventListener("change", function () {
  const value = this.value;
  const customW = document.getElementById("customWidth");
  const customH = document.getElementById("customHeight");

  if (value === "63x88") {
    currentSize = { width: 63, height: 88 };
    customW.style.display = "none";
    customH.style.display = "none";
  } else if (value === "59x86") {
    currentSize = { width: 59, height: 86 };
    customW.style.display = "none";
    customH.style.display = "none";
  } else {
    customW.style.display = "inline-block";
    customH.style.display = "inline-block";
    customW.addEventListener("input", () => {
      currentSize.width = parseFloat(customW.value) || 0;
      createCardSlots();
    });
    customH.addEventListener("input", () => {
      currentSize.height = parseFloat(customH.value) || 0;
      createCardSlots();
    });
  }
  createCardSlots();
});

document.getElementById("applyToAll").addEventListener("change", () => {
  if (selectedImages[0]) {
    selectedImages = new Array(9).fill(selectedImages[0]);
  }
  createCardSlots();
});

function populatePageSelector() {
  const selector = document.getElementById("pageCountSelector");
  for (let i = 1; i <= 30; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i} ページ`;
    selector.appendChild(option);
  }
  selector.value = 1;
}
populatePageSelector();

window.onload = () => createCardSlots();