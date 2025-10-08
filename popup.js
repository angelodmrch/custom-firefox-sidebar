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
          // Save selection
          await browser.storage.local.set({ 
            lastSite: option.url, 
            lastSiteLabel: option.label 
          });
          
          // Open sidebar first
          await browser.sidebarAction.open();
          
          // Wait a moment for sidebar to load, then navigate to the selected URL
          setTimeout(async () => {
            try {
              // Get all tabs to find the sidebar
              const tabs = await browser.tabs.query({});
              
              // Look for the sidebar tab (newtab.html)
              const sidebarTab = tabs.find(tab => 
                tab.url && tab.url.includes('newtab.html')
              );
              
              if (sidebarTab) {
                // Navigate the sidebar to the selected URL
                await browser.tabs.update(sidebarTab.id, { url: option.url });
              }
            } catch (error) {
              console.error('Error updating sidebar:', error);
              // If direct tab update fails, trigger storage change for sidebar to reload
              await browser.storage.local.set({ 
                lastSite: option.url, 
                lastSiteLabel: option.label,
                forceReload: Date.now() // Add timestamp to force reload
              });
            }
          }, 300);
          
          // Close popup
          window.close();
          
        } catch (error) {
          console.error('Error opening sidebar:', error);
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