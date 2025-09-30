const container = document.getElementById("optionsContainer");
const saveBtn = document.getElementById("saveBtn");
const addBtn = document.getElementById("addBtn");

let itemCounter = 0;

function createItemElement(label = "", url = "", index = null) {
  const id = index !== null ? index : itemCounter++;
  const div = document.createElement("div");
  div.className = "item-container";
  div.setAttribute("data-item-id", id);
  
  div.innerHTML = `
    <div class="item-inputs">
      <input type="text" placeholder="Label" value="${label}" data-type="label">
      <input type="text" placeholder="URL" value="${url}" data-type="url">
    </div>
    <button class="remove-btn" type="button">Remove</button>
  `;
  
  // Add event listener to the remove button
  const removeBtn = div.querySelector('.remove-btn');
  removeBtn.addEventListener('click', () => {
    removeItem(id);
  });
  
  return div;
}

function addItem() {
  const itemElement = createItemElement();
  container.appendChild(itemElement);
}

function removeItem(itemId) {
  console.log("Trying to remove item with ID:", itemId);
  const itemElement = container.querySelector(`[data-item-id="${itemId}"]`);
  console.log("Found element:", itemElement);
  if (itemElement) {
    itemElement.remove();
    console.log("Item removed successfully");
  } else {
    console.log("Item not found");
  }
}

async function loadOptions() {
  let options;
  
  // First try to load from browser storage (saved custom options)
  const { customOptions } = await browser.storage.local.get("customOptions");
  
  if (customOptions && customOptions.length > 0) {
    // Use saved custom options
    options = customOptions;
  } else {
    // Fall back to options.json if no custom options are set
    const res = await fetch(browser.runtime.getURL("options.json"));
    options = await res.json();
  }

  // Clear container first
  container.innerHTML = "";
  itemCounter = 0;

  options.forEach((opt, index) => {
    const itemElement = createItemElement(opt.label, opt.url, index);
    container.appendChild(itemElement);
    itemCounter = Math.max(itemCounter, index + 1);
  });
}

saveBtn.addEventListener("click", async () => {
  const newOptions = [];
  const itemContainers = container.querySelectorAll(".item-container");
  
  itemContainers.forEach((itemContainer) => {
    const labelInput = itemContainer.querySelector('[data-type="label"]');
    const urlInput = itemContainer.querySelector('[data-type="url"]');
    
    const label = labelInput.value.trim();
    const url = urlInput.value.trim();
    
    // Only save items that have both label and URL
    if (label && url) {
      newOptions.push({ label, url });
    }
  });
  
  await browser.storage.local.set({ customOptions: newOptions });
  alert("Options saved! Refresh new tab to apply.");
});

addBtn.addEventListener("click", addItem);

loadOptions();
