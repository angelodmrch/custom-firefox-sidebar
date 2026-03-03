# Custom Sidebar - Firefox Extension

A Firefox sidebar extension that lets you load any website inside the browser's native sidebar panel. Access AI assistants, tools, or any frequently-used site in a persistent side panel while browsing normally.

## Features

### Sidebar Panel
- Load any website inside Firefox's sidebar
- Dropdown selector to quickly switch between configured sites
- Remembers the last visited site across sessions
- Configurable default site that auto-loads on startup
- Dynamic sidebar title updates to match the selected site
- Live sync — changes from the popup or settings page reflect instantly without manual refresh

### Quick Access Popup
- Click the toolbar icon for a quick site list
- One-click to open any site directly in the sidebar
- Fast access to the settings page

### Right-Click Context Menu
- Right-click anywhere in the browser to open a site in the sidebar
- Menu entries are dynamically generated from your configured site list
- Stays in sync when you add or remove sites

### Settings Page
- Add, edit, and remove sites (label + URL)
- Set a default site that auto-loads when the sidebar opens
- Changes apply immediately to the sidebar and context menu
- Falls back to a bundled default list (ChatGPT, Grok, Copilot, DeepSeek, Claude) on first install

### Theme Support
- Automatic dark/light mode based on your OS preference
- Dark theme matches Firefox's native dark chrome

## Installation

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file from this project

Or install the packaged `custom-firefox-sidebar.xpi` file.

## Default Sites

| Site | URL |
|------|-----|
| ChatGPT | https://chat.openai.com/ |
| Grok | https://grok.com/ |
| Copilot | https://copilot.microsoft.com/ |
| DeepSeek | https://chat.deepseek.com/ |
| Claude | https://claude.ai/ |

All defaults can be replaced or extended from the settings page.

## Requirements

- Firefox 109.0 or later
- Manifest V3
