
import { auth, loginWithGoogle, startSync, saveConfigToCloud, forceFetchConfig } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const ALARM_NAME = 'sync_keep_alive';

// Restore auth state and start sync if logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Background: User restored:', user.uid);
    chrome.storage.local.set({ userStatus: { signedIn: true, email: user.email, uid: user.uid } });
    startSync(user.uid);
    // Create alarm for periodic checks (every 1 minute to respect Chrome limits, though dev can be faster)
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  } else {
    console.log('Background: No user session found.');
    chrome.storage.local.set({ userStatus: { signedIn: false } });
    chrome.alarms.clear(ALARM_NAME);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    const user = auth.currentUser;
    if (user) {
      console.log('Background: Alarm triggered, forcing sync check.');
      forceFetchConfig(user.uid);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.action === 'LOGIN') {
    loginWithGoogle()
      .then((user) => sendResponse({ success: true, uid: user.uid }))
      .catch((error) => {
        console.error('Background Login Error:', error);
        sendResponse({ success: false, error: error.toString() });
      });
    return true; // keep channel open
  }

  if (message.action === 'LOGOUT') {
    auth.signOut()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.toString() }));
    return true;
  }

  if (message.action === 'SAVE_CONFIG') {
    const user = auth.currentUser;
    console.log('Background: SAVE_CONFIG requested. User:', user ? user.uid : 'null', 'Data:', message.data);
    if (user) {
      // data should be the full config object e.g. { savedSites: [...] }
      saveConfigToCloud(user.uid, message.data);
    } else {
      console.warn('Background: Cannot save config, no user logged in.');
    }
  }

  if (message.action === 'open_side_panel') {
    // Attempt to open the side panel
    // Note: This requires a user interaction context. 
    // If sent from a content script context menu click, it technically should work in modern Chrome.
    // We also set the URL in storage so the panel knows what to load.

    if (message.url) {
      chrome.storage.local.set({ sidePanelUrl: message.url });
    }

    // Attempt to open the specific side panel for the current window
    // Chrome Side Panel API
    if (chrome.sidePanel && chrome.sidePanel.open) {
      // Use sender.tab.windowId if available, otherwise get current window
      const windowId = sender.tab ? sender.tab.windowId : null;

      if (windowId) {
        chrome.sidePanel.open({ windowId: windowId })
          .catch((error) => console.error('Error opening side panel:', error));
      } else {
        // Fallback for when sender.tab is missing (e.g. from extension pages)
        chrome.windows.getCurrent((window) => {
          if (window && window.id) {
            chrome.sidePanel.open({ windowId: window.id })
              .catch((err) => console.error('Error opening side panel (current window):', err));
          }
        });
      }
    }
  }

  if (message.action === 'open_new_tab') {
    if (message.url) {
      chrome.tabs.create({ url: message.url });
    }
  }
});

// Set default behavior on click
// We want the popup (options.html) to open, NOT the side panel.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error(error));
