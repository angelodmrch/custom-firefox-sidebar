const select = document.getElementById("pageSelect");
let availableOptions = []; // Store loaded options

// Load options from storage and populate dropdown
async function loadOptions() {
  try {
    // First try to load from browser storage (saved custom options)
    const { customOptions } = await browser.storage.local.get("customOptions");
    
    let options = customOptions;
    
    // If no custom options in storage, fall back to options.json
    if (!options || options.length === 0) {
      const res = await fetch(browser.runtime.getURL("options.json"));
      options = await res.json();
    }

    // Store options
    availableOptions = options;

    // Clear existing options first
    select.innerHTML = "";

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a site...";
    select.appendChild(defaultOption);

    // Populate dropdown
    options.forEach((opt, index) => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.url;
      optionEl.textContent = opt.label;
      select.appendChild(optionEl);
    });

    // Load last selected option from storage and auto-redirect
    const { lastSite, lastSiteLabel } = await browser.storage.local.get(["lastSite", "lastSiteLabel"]);
    if (lastSite) {
      select.value = lastSite;
      // Update sidebar title to show the last selected option
      if (lastSiteLabel) {
        updateSidebarTitle(lastSiteLabel);
      }
      // Auto-redirect to the last selected site
      location.href = lastSite;
    } else {
      // Set default title if no option was previously selected
      updateSidebarTitle("My Sidebar");
    }
  } catch (error) {
    console.error("Error loading options:", error);
  }
}

select.addEventListener("change", () => {
  const url = select.value;
  if (url) {
    // Find the selected option's label
    const selectedOption = select.options[select.selectedIndex];
    const selectedLabel = selectedOption.textContent;
    
    // Save selection
    browser.storage.local.set({ lastSite: url, lastSiteLabel: selectedLabel });
    
    // Update sidebar title
    updateSidebarTitle(selectedLabel);
    
    // Redirect to the selected URL
    location.href = url;
  }
});

// Function to update the sidebar title
function updateSidebarTitle(label) {
  try {
    // Update the document title (which affects the sidebar title)
    document.title = label || "My Sidebar";
    
    // Also try to update via browser API if available
    if (browser.sidebarAction && browser.sidebarAction.setTitle) {
      browser.sidebarAction.setTitle({ title: label || "My Sidebar" });
    }
  } catch (error) {
    console.log("Could not update sidebar title:", error);
  }
}

// Function to update the sidebar title
function updateSidebarTitle(label) {
  try {
    // Update the document title (which affects the sidebar title)
    document.title = label || "My Sidebar";
    
    // Also try to update via browser API if available
    if (browser.sidebarAction && browser.sidebarAction.setTitle) {
      browser.sidebarAction.setTitle({ title: label || "My Sidebar" });
    }
  } catch (error) {
    console.log("Could not update sidebar title:", error);
  }
}

loadOptions();