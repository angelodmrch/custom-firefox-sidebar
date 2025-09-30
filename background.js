// Background script - Context menu functionality disabled
// The context menu was appearing on the toolbar icon instead of sidebar
// Keeping this file for potential future sidebar-specific functionality

let currentOptions = [];

// Use browser API for Firefox compatibility
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

console.log("Background script loaded - popup enabled");