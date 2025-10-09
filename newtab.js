const select = document.getElementById("pageSelect");
let availableOptions = []; // Store loaded options

// Apply theme class to body based on browser preference
function applyTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// Listen for theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
}

// Load options from storage and populate dropdown
async function loadOptions() {
  try {
    // First try to load from browser storage (saved custom options)
    const { customOptions, defaultOption } = await browser.storage.local.get(["customOptions", "defaultOption"]);
    
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
    const defaultOptionEl = document.createElement("option");
    defaultOptionEl.value = "";
    defaultOptionEl.textContent = "Select a site...";
    select.appendChild(defaultOptionEl);

    // Populate dropdown
    options.forEach((opt, index) => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.url;
      optionEl.textContent = opt.label;
      select.appendChild(optionEl);
    });

    // Check if there's a default option set
    if (defaultOption) {
      // Find the label for the default option
      const defaultOpt = options.find(opt => opt.url === defaultOption);
      if (defaultOpt) {
        select.value = defaultOption;
        updateSidebarTitle(defaultOpt.label);
        // Auto-redirect to the default option
        location.href = defaultOption;
        return;
      }
    }

    // If no default option, check for last selected option
    const { lastSite, lastSiteLabel } = await browser.storage.local.get(["lastSite", "lastSiteLabel"]);
    if (lastSite && !defaultOption) {
      select.value = lastSite;
      // Update sidebar title to show the last selected option
      if (lastSiteLabel) {
        updateSidebarTitle(lastSiteLabel);
      }
      // Auto-redirect to the last selected site only if no default is set
      location.href = lastSite;
    } else {
      // Set default title if no option was previously selected
      updateSidebarTitle("My Sidebar");
    }
  } catch (error) {
    console.error("Error loading options:", error);
  }
}

// Listen for storage changes (when popup sets lastSite or forces reload)
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    // Handle force reload from popup or options
    if (changes.forceReload) {
      // Check if there's a new default option or just reload
      browser.storage.local.get(['defaultOption', 'lastSite', 'lastSiteLabel']).then(({ defaultOption, lastSite, lastSiteLabel }) => {
        if (defaultOption) {
          // Navigate to the new default option
          const selectedOption = availableOptions.find(opt => opt.url === defaultOption);
          if (selectedOption) {
            updateSidebarTitle(selectedOption.label);
            // Don't update icon here - let the page load event handle it
            location.href = defaultOption;
          } else {
            // Fallback to reload if option not found
            location.reload();
          }
        } else if (lastSite) {
          // Fallback to last site
          updateSidebarTitle(lastSiteLabel);
          // Don't update icon here - let the page load event handle it
          location.href = lastSite;
        } else {
          // Just reload
          location.reload();
        }
      });
    }
    // Handle other storage changes
    else if (changes.lastSite || changes.defaultOption) {
      // Regular reload for other storage changes
      location.reload();
    }
  }
});

select.addEventListener("change", () => {
  const url = select.value;
  if (url) {
    // Find the selected option's label
    const selectedOption = select.options[select.selectedIndex];
    const selectedLabel = selectedOption.textContent;
    
    // Save selection as last site (but don't override default)
    browser.storage.local.set({ lastSite: url, lastSiteLabel: selectedLabel });
    
    // Update sidebar title and icon
    updateSidebarTitle(selectedLabel);
    // Don't update icon here - let the page load event handle it
    
    // Redirect to the selected URL
    location.href = url;
  }
});

// Function to update the sidebar title (keep for local document title)
function updateSidebarTitle(label) {
  try {
    // Update the document title (which affects the sidebar title)
    document.title = label || "My Sidebar";
  } catch (error) {
    console.log("Could not update sidebar title:", error);
  }
}

// Apply theme on load
applyTheme();
loadOptions();