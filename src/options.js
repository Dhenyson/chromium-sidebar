// Save options to chrome.storage
function saveOptions() {
  const side = document.querySelector('input[name="side"]:checked').value;
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const clickAction = document.querySelector('input[name="clickAction"]:checked').value;

  chrome.storage.local.set({
    sidebarSide: side,
    sidebarVisibility: visibility,
    clickAction: clickAction
  }, function () {
    // Send update to cloud
    chrome.runtime.sendMessage({
      action: 'SAVE_CONFIG',
      data: {
        sidebarSide: side,
        sidebarVisibility: visibility,
        clickAction: clickAction
      }
    });

    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.innerText = 'Options saved.';
    status.classList.add('show');

    setTimeout(function () {
      status.classList.remove('show');
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.local.get({
    sidebarSide: 'right',     // Default value
    sidebarVisibility: 'visible', // Default value
    clickAction: 'sidebar' // Default value
  }, function (items) {
    // Side
    const sideRadios = document.getElementsByName('side');
    for (const radio of sideRadios) {
      if (radio.value === items.sidebarSide) {
        radio.checked = true;
      }
    }

    // Visibility
    const visRadios = document.getElementsByName('visibility');
    for (const radio of visRadios) {
      if (radio.value === items.sidebarVisibility) {
        radio.checked = true;
      }
    }

    // Click Action
    const actionRadios = document.getElementsByName('clickAction');
    for (const radio of actionRadios) {
      if (radio.value === items.clickAction) {
        radio.checked = true;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// Add listeners
const sideRadios = document.getElementsByName('side');
for (const radio of sideRadios) {
  radio.addEventListener('change', saveOptions);
}

const visRadios = document.getElementsByName('visibility');
for (const radio of visRadios) {
  radio.addEventListener('change', saveOptions);
}

const actionRadios = document.getElementsByName('clickAction');
for (const radio of actionRadios) {
  radio.addEventListener('change', saveOptions);
}

document.getElementById('open-settings-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'chrome://settings/appearance' });
});

import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Login/Logout UI Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userStatus = document.getElementById('user-status');
const authLoading = document.getElementById('auth-loading');
const status = document.getElementById('status');

// 1. Listen for Auth State Changes (Persistence)
onAuthStateChanged(auth, (user) => {
  // Hide loading indicator once we have a response (null or user object)
  if (authLoading) authLoading.style.display = 'none';

  if (user) {
    // User is signed in.
    if (userInfo) userInfo.style.display = 'block';
    if (userStatus) userStatus.innerText = 'Syncing as: ' + user.email;
    if (loginBtn) loginBtn.style.display = 'none';
    if (status) status.innerText = '';
  } else {
    // User is signed out.
    if (userInfo) userInfo.style.display = 'none';
    if (loginBtn) {
      loginBtn.style.display = 'block';
      loginBtn.innerText = 'Sign in with Google';
    }
    if (status) status.innerText = '';
  }
});

// 2. Handle Login Click
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    loginBtn.innerText = 'Signing in...';
    // Hide previous error messages
    if (status) status.innerText = '';

    chrome.runtime.sendMessage({ action: 'LOGIN' }, (response) => {
      if (response && response.success) {
        // storage listener will handle UI update
        if (status) status.innerText = 'Login successful!';
      } else {
        loginBtn.innerText = 'Sign in with Google';
        if (status) status.innerText = 'Login failed: ' + (response ? response.error : 'Unknown');
      }
    });
  });
}

// 3. Handle Logout Click
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      if (logoutBtn) logoutBtn.innerText = 'Signing out...';
      await signOut(auth);
      // UI update is handled by onAuthStateChanged
      if (status) status.innerText = 'Signed out.';
    } catch (error) {
      console.error('Logout error:', error);
      if (status) status.innerText = 'Logout failed.';
      if (logoutBtn) logoutBtn.innerText = 'Sign Out';
    }
  });
}
