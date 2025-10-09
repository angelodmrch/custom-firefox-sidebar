// Function to create dynamic context menu items
async function createContextMenuItems() {
  // Clear existing menu items
  await browser.menus.removeAll();
  
  try {
    // Get options from storage
    const { customOptions } = await browser.storage.local.get("customOptions");
    
    let options = customOptions;
    
    // If no custom options in storage, fall back to options.json
    if (!options || options.length === 0) {
      const res = await fetch(browser.runtime.getURL("options.json"));
      options = await res.json();
    }

    // Create menu items for each option
    options.forEach((option, index) => {
      browser.menus.create({
        id: `site-${index}`,
        title: option.label,
        contexts: ["all"]
      });
    });

    // Store options for later use
    window.availableOptions = options;

  } catch (error) {
    console.error("Error creating context menu items:", error);
  }
}

// Handle menu item clicks
browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("site-")) {
    // Extract the index from the menu item ID
    const index = parseInt(info.menuItemId.replace("site-", ""));
    const selectedOption = window.availableOptions[index];
    
    if (selectedOption) {
      // Open sidebar FIRST (must be in direct user input handler)
      browser.sidebarAction.open();
      
      // Save as new default and trigger sidebar reload (after opening)
      browser.storage.local.set({
        defaultOption: selectedOption.url,
        lastSite: selectedOption.url,
        lastSiteLabel: selectedOption.label,
        forceReload: Date.now()
      });
    }
  }
});

// Listen for storage changes to update sidebar when options change
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    // Recreate context menu if options changed
    if (changes.customOptions) {
      createContextMenuItems();
    }
  }
});

// Initialize context menu on extension startup
createContextMenuItems();