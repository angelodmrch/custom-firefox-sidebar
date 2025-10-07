// Create context menu item for the sidebar button
browser.menus.create({
    id: "open-about",
    title: "Sobre / About",
    contexts: ["browser_action"] // This adds it to the sidebar button's context menu
});

// Handle clicks on the menu item
browser.menus.onClicked.addListener((info, tab) => {
if (info.menuItemId === "open-about") {
    // Open your about page in a new tab
    browser.tabs.create({
    url: "https://yourwebsite.com/about"
    });
    
    // Or open a local about page:
    // browser.tabs.create({
    //   url: browser.runtime.getURL("about.html")
    // });
}
});