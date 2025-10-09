// Popup script for browser action
const optionsList = document.getElementById('optionsList');
const openOptionsBtn = document.getElementById('openOptions');

// Load and display options
async function loadPopupOptions() {
  try {
    // Get options from storage or fallback to JSON
    const { customOptions } = await browser.storage.local.get("customOptions");
    
    let options = customOptions;
    
    if (!options || options.length === 0) {
      const res = await fetch(browser.runtime.getURL("options.json"));
      options = await res.json();
    }

    // Clear existing options
    optionsList.innerHTML = '';

    // Create option items
    options.forEach((option, index) => {
      const optionItem = document.createElement('div');
      optionItem.className = 'option-item';
      optionItem.innerHTML = `
        <span class="option-label">${option.label}</span>
      `;
      
      optionItem.addEventListener('click', async () => {
        try {
          // Open sidebar FIRST (must be in direct user input handler)
          try {
            await browser.sidebarAction.open();
          } catch (sidebarError) {
            console.log('Sidebar API call failed:', sidebarError);
          }
          
          // Close popup immediately
          window.close();
          
          // Save selection as both last site AND default (after sidebar is opened)
          await browser.storage.local.set({ 
            lastSite: option.url, 
            lastSiteLabel: option.label,
            defaultOption: option.url, // Set as new default
            forceReload: Date.now() // Use forceReload to trigger navigation
          });
          
        } catch (error) {
          console.error('Error handling option selection:', error);
          // Still close the popup even if there's an error
          window.close();
        }
      });
      
      optionsList.appendChild(optionItem);
    });

  } catch (error) {
    console.error('Error loading popup options:', error);
    optionsList.innerHTML = '<div style="padding: 10px; color: #999;">Error loading options</div>';
  }
}

// Handle options button click
openOptionsBtn.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});

// Load options when popup opens
loadPopupOptions();