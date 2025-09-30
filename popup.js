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
        // Save selection
        await browser.storage.local.set({ 
          lastSite: option.url, 
          lastSiteLabel: option.label 
        });
        
        // Get current active tab and navigate
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          browser.tabs.update(tabs[0].id, { url: option.url });
        } else {
          browser.tabs.create({ url: option.url });
        }
        
        // Close popup
        window.close();
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