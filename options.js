const container = document.getElementById("optionsContainer");
const saveBtn = document.getElementById("saveBtn");
const addBtn = document.getElementById("addBtn");
const defaultSelect = document.getElementById("defaultSelect");

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
  updateDefaultSelect();
}

function removeItem(itemId) {
  console.log("Trying to remove item with ID:", itemId);
  const itemElement = container.querySelector(`[data-item-id="${itemId}"]`);
  console.log("Found element:", itemElement);
  if (itemElement) {
    itemElement.remove();
    console.log("Item removed successfully");
    updateDefaultSelect();
  } else {
    console.log("Item not found");
  }
}

function updateDefaultSelect() {
  const currentDefault = defaultSelect.value;
  defaultSelect.innerHTML = '<option value="">No default (show selector)</option>';
  
  const itemContainers = container.querySelectorAll(".item-container");
  itemContainers.forEach((itemContainer) => {
    const labelInput = itemContainer.querySelector('[data-type="label"]');
    const urlInput = itemContainer.querySelector('[data-type="url"]');
    
    const label = labelInput.value.trim();
    const url = urlInput.value.trim();
    
    if (label && url) {
      const option = document.createElement("option");
      option.value = url;
      option.textContent = label;
      defaultSelect.appendChild(option);
    }
  });
  
  // Restore previous selection if it still exists
  if (currentDefault) {
    defaultSelect.value = currentDefault;
  }
}

async function loadOptions() {
  let options;
  
  // First try to load from browser storage (saved custom options)
  const { customOptions, defaultOption } = await browser.storage.local.get(["customOptions", "defaultOption"]);
  
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
  
  // Update default select dropdown
  updateDefaultSelect();
  
  // Set the current default option
  if (defaultOption) {
    defaultSelect.value = defaultOption;
  }
}

// Add event listeners to update default select when inputs change
container.addEventListener('input', (e) => {
  if (e.target.matches('[data-type="label"], [data-type="url"]')) {
    updateDefaultSelect();
  }
});

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
  
  const defaultOption = defaultSelect.value;
  
  await browser.storage.local.set({ 
    customOptions: newOptions,
    defaultOption: defaultOption
  });
  
  alert("Options saved! Refresh new tab to apply.");
});

addBtn.addEventListener("click", addItem);

// Add event listener for default option changes
defaultSelect.addEventListener("change", async () => {
  try {
    const defaultOption = defaultSelect.value;
    
    // Save the new default option immediately
    await browser.storage.local.set({ 
      defaultOption: defaultOption,
      forceReload: Date.now() // Use forceReload to trigger sidebar reload
    });
    
    console.log("Default option changed to:", defaultOption);
    
    // Just save the change - the sidebar will detect it via storage listener
    // No need to try close/open from options page
    
    // Optional: Show a brief feedback to the user
    const originalText = defaultSelect.style.backgroundColor;
    defaultSelect.style.backgroundColor = "#4CAF50";
    setTimeout(() => {
      defaultSelect.style.backgroundColor = originalText;
    }, 200);
    
  } catch (error) {
    console.error("Error saving default option:", error);
  }
});

loadOptions();
