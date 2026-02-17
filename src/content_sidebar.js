// content_sidebar.js

(function () {
  try {
    // Constants
    const SIDEBAR_ID = 'sdbdh-sidebar-root';
    const CLASS_ICON_BASE = 'sdbdh-icon';
    const CLASS_ICON_ADD = 'sdbdh-icon-add';
    const CLASS_ICON_SETTINGS = 'sdbdh-icon-settings';

    const CLASS_SIDEBAR_LEFT = 'sdbdh-sidebar-left';
    const CLASS_SIDEBAR_RIGHT = 'sdbdh-sidebar-right';
    const CLASS_BODY_SQUASH_LEFT = 'sdbdh-body-squash-left';
    const CLASS_BODY_SQUASH_RIGHT = 'sdbdh-body-squash-right';
    const CLASS_SIDEBAR_HIDDEN = 'sdbdh-hidden';

    const SETTINGS_MODAL_ID = 'sdbdh-settings-modal';
    const ADD_MODAL_ID = 'sdbdh-add-modal';
    const EDIT_GROUP_MODAL_ID = 'sdbdh-edit-group-modal';
    const TOOLTIP_ID = 'sdbdh-tooltip';
    const CONTEXT_MENU_ID = 'sdbdh-context-menu';

    // Prevent duplicate injection
    if (document.getElementById(SIDEBAR_ID)) {
      console.log('Sidebar already exists, skipping injection.');
      return;
    }

    // --- HTML Elements Creation ---

    // 1. Sidebar Root
    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;

    // 2. Apps Container
    const appsContainer = document.createElement('div');
    appsContainer.id = 'sdbdh-apps-container';
    sidebar.appendChild(appsContainer);

    // 3. Settings Button (Gear)
    const bottomIcon = document.createElement('div');
    bottomIcon.className = `${CLASS_ICON_BASE} ${CLASS_ICON_SETTINGS}`;
    bottomIcon.innerHTML = '&#9881;'; // Gear Symbol
    bottomIcon.dataset.title = 'Settings';
    bottomIcon.addEventListener('click', openSettingsModal);
    sidebar.appendChild(bottomIcon);

    // 4. Add Button (+)
    const addBtn = document.createElement('div');
    addBtn.className = `${CLASS_ICON_BASE} ${CLASS_ICON_ADD}`;
    addBtn.innerHTML = '+';
    addBtn.dataset.title = 'Add site';
    addBtn.addEventListener('click', openAddModal);

    // 5. Tooltip Element
    const tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;

    // 6. Context Menu Element
    const contextMenu = document.createElement('div');
    contextMenu.id = CONTEXT_MENU_ID;

    const ICON_TRASH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const ICON_EXTERNAL = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
    const ICON_SIDEBAR = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;
    const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const ICON_FOLDER_PATH = `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>`;
    const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

    contextMenu.innerHTML = `
      <div class="sdbdh-context-item" id="sdbdh-sidebar-item">
        <span class="sdbdh-context-icon">${ICON_SIDEBAR}</span> Open in Sidebar
      </div>
      <div class="sdbdh-context-item" id="sdbdh-visit-item">
        <span class="sdbdh-context-icon">${ICON_EXTERNAL}</span> Visit Site
      </div>
      <div class="sdbdh-context-item" id="sdbdh-copy-item">
        <span class="sdbdh-context-icon">${ICON_COPY}</span> Copy URL
      </div>
      <div class="sdbdh-context-item" id="sdbdh-edit-group-item" style="display:none">
        <span class="sdbdh-context-icon">${ICON_EDIT}</span> Edit Group
      </div>
      <div class="sdbdh-context-divider"></div>
      <div class="sdbdh-context-item sdbdh-text-danger" id="sdbdh-remove-item">
        <span class="sdbdh-context-icon">${ICON_TRASH}</span> Remove
      </div>
    `;

    // Hit Areas for Auto Mode
    const hitAreaLeft = document.createElement('div');
    hitAreaLeft.className = 'sdbdh-hit-area sdbdh-hit-area-left';
    const hitAreaRight = document.createElement('div');
    hitAreaRight.className = 'sdbdh-hit-area sdbdh-hit-area-right';


    // 7. Settings Modal
    const settingsModal = createModal(SETTINGS_MODAL_ID, 'Settings', `
      <div class="sdbdh-form-group">
        <label class="sdbdh-label">Sync</label>
        <div id="sdbdh-auth-section" style="padding: 10px; background: rgba(0,0,0,0.03); border-radius: 6px;">
          <div id="sdbdh-auth-loading" style="font-size: 13px; opacity: 0.7; margin-bottom: 5px;">Loading...</div>
          
          <button id="sdbdh-login-btn" style="display: none; width: 100%; padding: 8px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Sign in with Google
          </button>

          <div id="sdbdh-user-info" style="display: none;">
            <div id="sdbdh-user-status" style="font-size: 13px; margin-bottom: 8px; font-weight: 500; word-break: break-all;"></div>
            <button id="sdbdh-logout-btn" style="width: 100%; padding: 6px; background: transparent; border: 1px solid #d93025; color: #d93025; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div class="sdbdh-form-group">
        <label class="sdbdh-label">Position</label>
        <div class="sdbdh-radio-group">
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-side" value="left"> Left</label>
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-side" value="right"> Right</label>
        </div>
      </div>
      <div class="sdbdh-form-group">
        <label class="sdbdh-label">Visibility</label>
        <div class="sdbdh-radio-group">
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-visibility" value="visible"> Always Show</label>
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-visibility" value="auto"> Automatic</label>
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-visibility" value="hidden"> Always Hide</label>
        </div>
      </div>
      <div class="sdbdh-form-group">
        <label class="sdbdh-label">Click Action</label>
        <div class="sdbdh-radio-group">
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-click-action" value="sidebar"> Open in Sidebar</label>
          <label class="sdbdh-radio-label"><input type="radio" name="sdbdh-click-action" value="newtab"> Open in New Tab</label>
        </div>
      </div>
    `);

    // 8. Add Site Modal
    const addModal = createModal(ADD_MODAL_ID, 'Add Site', `
      <div class="sdbdh-form-group">
        <label class="sdbdh-label">Name</label>
        <input type="text" id="sdbdh-site-name" class="sdbdh-input" placeholder="Site Name">
      </div>
      <div class="sdbdh-form-group">
        <label class="sdbdh-label">URL</label>
        <input type="text" id="sdbdh-site-url" class="sdbdh-input" placeholder="https://example.com">
      </div>
      <div style="text-align: right;">
        <button id="sdbdh-save-site-btn" class="sdbdh-btn sdbdh-btn-primary">Save</button>
      </div>
    `);

    // 9. Edit Group Modal
    const editGroupModal = createModal(EDIT_GROUP_MODAL_ID, 'Edit Group', `
    <div class="sdbdh-form-group">
      <label class="sdbdh-label">Group Name</label>
      <input type="text" id="sdbdh-group-name" class="sdbdh-input" placeholder="Group Name">
    </div>
    <div class="sdbdh-form-group">
      <label class="sdbdh-label">Color</label>
      <div class="sdbdh-color-picker" id="sdbdh-group-colors">
        <!-- Swatches generated in JS -->
      </div>
      <input type="hidden" id="sdbdh-group-color-input">
    </div>
    <div style="text-align: right;">
      <button id="sdbdh-save-group-btn" class="sdbdh-btn sdbdh-btn-primary">Save</button>
    </div>
  `);

    // Populate colors
    const colorSwatches = ['#A8C7FA', '#F28B82', '#FDD663', '#81C995', '#C58AF9', '#8DB9F4', '#E6C9A8', '#E8EAED'];
    const colorPickerContainer = editGroupModal.querySelector('#sdbdh-group-colors');
    const colorInput = editGroupModal.querySelector('#sdbdh-group-color-input');

    colorSwatches.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'sdbdh-color-swatch';
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.addEventListener('click', () => {
        // deselect all
        colorPickerContainer.querySelectorAll('.sdbdh-color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        colorInput.value = color;
      });
      colorPickerContainer.appendChild(swatch);
    });

    // --- Event Listeners & Logic ---

    function createModal(id, title, contentHtml) {
      const el = document.createElement('div');
      el.id = id;
      // Basic inline styles to ensure it works even if CSS is slow/broken
      el.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(0, 0, 0, 0.5); z-index: 2147483648;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; pointer-events: none; transition: opacity 0.3s;
      `;

      el.innerHTML = `
        <div class="sdbdh-modal-content">
          <div class="sdbdh-modal-header">
            <div class="sdbdh-modal-title">${title}</div>
            <button class="sdbdh-close-btn">&times;</button>
          </div>
          ${contentHtml}
        </div>
      `;

      // Ensure close events are attached
      const closeBtn = el.querySelector('.sdbdh-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => closeModal(el));

      el.addEventListener('click', (e) => { if (e.target === el) closeModal(el); });

      return el;
    }

    function openModal(modalEl) {
      modalEl.style.opacity = '1';
      modalEl.style.pointerEvents = 'auto';
    }

    function closeModal(modalEl) {
      modalEl.style.opacity = '0';
      modalEl.style.pointerEvents = 'none';

      // Clear inputs if add modal
      if (modalEl.id === ADD_MODAL_ID) {
        // Optional: clear inputs
      }
    }

    // Edit Group Logic 
    let currentEditGroupId = null;

    function openEditGroupModal(groupId) {
      currentEditGroupId = groupId;

      chrome.storage.local.get({ savedSites: [] }, function (items) {
        const root = items.savedSites || [];
        // Sidebar to find group
        function findGroup(list, id) {
          for (const item of list) {
            if (item.id === id && item.items) return item;
            if (item.items) {
              const found = findGroup(item.items, id);
              if (found) return found;
            }
          }
          return null;
        }

        const group = findGroup(root, groupId);
        if (!group) return;

        const nameInput = editGroupModal.querySelector('#sdbdh-group-name');
        const colorIn = editGroupModal.querySelector('#sdbdh-group-color-input');

        nameInput.value = group.name || 'Group';
        colorIn.value = group.color || '#A8C7FA'; // default

        // Select swatch
        const swatches = editGroupModal.querySelectorAll('.sdbdh-color-swatch');
        swatches.forEach(s => {
          s.classList.remove('selected');
          if (s.dataset.color === colorIn.value) {
            s.classList.add('selected');
          }
        });

        openModal(editGroupModal);
      });
    }

    const saveGroupBtn = editGroupModal.querySelector('#sdbdh-save-group-btn');
    if (saveGroupBtn) saveGroupBtn.addEventListener('click', saveGroup);

    function saveGroup() {
      if (!currentEditGroupId) return;
      const nameInput = editGroupModal.querySelector('#sdbdh-group-name');
      const colorInput = editGroupModal.querySelector('#sdbdh-group-color-input');

      const name = nameInput ? nameInput.value : 'Group';
      const color = colorInput ? colorInput.value : '#A8C7FA';

      chrome.storage.local.get({ savedSites: [] }, function (items) {
        const root = items.savedSites || [];

        function updateGroup(list, id) {
          for (const item of list) {
            if (item.id === id && item.items) {
              item.name = name;
              item.color = color;
              return true;
            }
            if (item.items) {
              if (updateGroup(item.items, id)) return true;
            }
          }
          return false;
        }

        if (updateGroup(root, currentEditGroupId)) {
          chrome.storage.local.set({ savedSites: root }, () => {
            chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { savedSites: root } });
            closeModal(editGroupModal);
          });
        }
      });
    }

    // --- Visibility & Auto Mode Logic ---
    let currentVisibility = 'visible';
    let isSidebarLeft = false;

    function updateLayoutState(side, visibility) {
      isSidebarLeft = (side === 'left');
      currentVisibility = visibility;

      // 1. Position Sidebar Class
      sidebar.classList.remove(CLASS_SIDEBAR_LEFT, CLASS_SIDEBAR_RIGHT);
      sidebar.classList.add(isSidebarLeft ? CLASS_SIDEBAR_LEFT : CLASS_SIDEBAR_RIGHT);

      // 2. Squash Body Logic
      document.body.classList.remove(CLASS_BODY_SQUASH_LEFT, CLASS_BODY_SQUASH_RIGHT);
      if (visibility === 'visible') {
        document.body.classList.add(isSidebarLeft ? CLASS_BODY_SQUASH_LEFT : CLASS_BODY_SQUASH_RIGHT);
      }

      // 3. Visibility Classes & Hit Areas
      hitAreaLeft.classList.remove('sdbdh-active');
      hitAreaRight.classList.remove('sdbdh-active');
      sidebar.classList.remove(CLASS_SIDEBAR_HIDDEN); // Reset first

      if (visibility === 'hidden') {
        sidebar.classList.add(CLASS_SIDEBAR_HIDDEN);
      } else if (visibility === 'auto') {
        sidebar.classList.add(CLASS_SIDEBAR_HIDDEN); // Start hidden
        if (isSidebarLeft) hitAreaLeft.classList.add('sdbdh-active');
        else hitAreaRight.classList.add('sdbdh-active');
      }
    }

    function handleAutoShow() {
      if (currentVisibility === 'auto') {
        sidebar.classList.remove(CLASS_SIDEBAR_HIDDEN);
      }
    }

    hitAreaLeft.addEventListener('mouseenter', handleAutoShow);
    hitAreaRight.addEventListener('mouseenter', handleAutoShow);
    sidebar.addEventListener('mouseenter', handleAutoShow);

    sidebar.addEventListener('mouseleave', () => {
      if (currentVisibility === 'auto') {
        sidebar.classList.add(CLASS_SIDEBAR_HIDDEN);
      }
    });


    // --- Tooltip Logic ---
    function showTooltip(e) {
      if (contextMenu.classList.contains('sdbdh-show')) return;
      if (sidebar.classList.contains(CLASS_SIDEBAR_HIDDEN)) return;

      const target = e.currentTarget;
      const text = target.dataset.title;
      if (!text) return;

      tooltip.textContent = text;
      tooltip.className = 'sdbdh-show';

      const rect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      const top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      tooltip.style.top = `${top}px`;

      if (isSidebarLeft) {
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.right = 'auto';
        tooltip.classList.add('sdbdh-tooltip-right');
      } else {
        tooltip.style.left = 'auto';
        tooltip.style.right = `${window.innerWidth - rect.left + 10}px`;
        tooltip.classList.add('sdbdh-tooltip-left');
      }
    }

    function hideTooltip() {
      tooltip.classList.remove('sdbdh-show', 'sdbdh-tooltip-left', 'sdbdh-tooltip-right');
    }

    function attachTooltipEvents(el) {
      el.addEventListener('mouseenter', showTooltip);
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('click', hideTooltip);
    }

    attachTooltipEvents(bottomIcon);
    attachTooltipEvents(addBtn);


    // --- Context Menu Logic ---
    let contextTargetId = null;
    let contextTargetUrl = null;

    function hideContextMenu() {
      contextMenu.classList.remove('sdbdh-show');
      contextTargetId = null;
      contextTargetUrl = null;
    }

    document.addEventListener('click', hideContextMenu);
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('.sdbdh-icon')) {
        hideContextMenu();
      }
    });

    contextMenu.querySelector('#sdbdh-sidebar-item').addEventListener('click', () => {
      if (contextTargetUrl) {
        chrome.runtime.sendMessage({ action: 'open_side_panel', url: contextTargetUrl });
        hideContextMenu();
      }
    });

    contextMenu.querySelector('#sdbdh-visit-item').addEventListener('click', () => {
      if (contextTargetUrl) {
        window.open(contextTargetUrl, '_blank');
        hideContextMenu();
      }
    });

    contextMenu.querySelector('#sdbdh-edit-group-item').addEventListener('click', () => {
      if (contextTargetId) {
        openEditGroupModal(contextTargetId);
        hideContextMenu();
      }
    });

    contextMenu.querySelector('#sdbdh-copy-item').addEventListener('click', () => {
      if (contextTargetUrl) {
        navigator.clipboard.writeText(contextTargetUrl).then(() => {
          hideContextMenu();
        }).catch(err => {
          console.error('Failed to copy: ', err);
          hideContextMenu();
        });
      }
    });

    contextMenu.querySelector('#sdbdh-remove-item').addEventListener('click', () => {
      if (contextTargetId) {
        removeSite(contextTargetId);
        hideContextMenu();
      }
    });

    function removeSite(siteId) {
      chrome.storage.local.get({ savedSites: [] }, function (items) {
        let sites = items.savedSites;

        // Recursive remove
        function removeFromList(list, id) {
          const idx = list.findIndex(s => s.id === id);
          if (idx > -1) {
            list.splice(idx, 1);
            return true;
          }
          for (const item of list) {
            if (item.items && removeFromList(item.items, id)) {
              return true;
            }
          }
          return false;
        }

        removeFromList(sites, siteId);
        chrome.storage.local.set({ savedSites: sites }, () => {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { savedSites: sites } });
        });
      });
    }

    // --- Drag and Drop Logic ---
    let draggedItem = null;

    function initDragEvents(el, siteId) {
      el.draggable = true;
      // Convert siteId to number for consistent comparison
      const numSiteId = parseInt(siteId);

      el.addEventListener('dragstart', (e) => {
        draggedItem = el;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', numSiteId);
        el.classList.add('sdbdh-dragging');
        hideTooltip();
      });

      el.addEventListener('dragend', (e) => {
        draggedItem = null;
        el.classList.remove('sdbdh-dragging');
        appsContainer.querySelectorAll('.sdbdh-icon').forEach(icon => {
          icon.classList.remove('sdbdh-drag-over', 'sdbdh-drag-top', 'sdbdh-drag-bottom', 'sdbdh-drag-group');
        });
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();

        if (el === draggedItem) return;
        // Don't interact if we are dragging inside ourself (folder) - logic handled by pointer-events usually but let's be safe.
        if (el.contains(draggedItem)) return;

        // Calculate position
        const rect = el.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const height = rect.height;
        const threshold = 0.25; // 25% top/bottom for reorder

        // Clear previous classes
        el.classList.remove('sdbdh-drag-top', 'sdbdh-drag-bottom', 'sdbdh-drag-group');

        if (offsetY < height * threshold) {
          // Top 25% -> Insert Before
          el.classList.add('sdbdh-drag-top');
          e.dataTransfer.dropEffect = 'move';
        } else if (offsetY > height * (1 - threshold)) {
          // Bottom 25% -> Insert After
          el.classList.add('sdbdh-drag-bottom');
          e.dataTransfer.dropEffect = 'move';
        } else {
          // Middle 50% -> Group
          el.classList.add('sdbdh-drag-group');
          e.dataTransfer.dropEffect = 'move';
        }
      });

      el.addEventListener('dragleave', (e) => {
        el.classList.remove('sdbdh-drag-top', 'sdbdh-drag-bottom', 'sdbdh-drag-group');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
        const targetId = numSiteId;

        // Determine action based on class
        let action = 'group';
        if (el.classList.contains('sdbdh-drag-top')) action = 'before';
        else if (el.classList.contains('sdbdh-drag-bottom')) action = 'after';

        // Cleanup classes
        el.classList.remove('sdbdh-drag-top', 'sdbdh-drag-bottom', 'sdbdh-drag-group');

        if (sourceId && targetId && sourceId !== targetId) {
          moveOrGroupSites(sourceId, targetId, action);
        }
      });
    }

    function moveOrGroupSites(sourceId, targetId, action) {
      chrome.storage.local.get({ savedSites: [] }, function (items) {
        let rootSites = items.savedSites || [];

        // Sidebar to find item and its parent list
        function findItem(list, id) {
          if (!list || !Array.isArray(list)) return null;

          for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
              return { item: list[i], index: i, list: list };
            }
            if (list[i].items) { // Check inside groups
              const found = findItem(list[i].items, id);
              if (found) return found;
            }
          }
          return null;
        }

        const source = findItem(rootSites, sourceId);
        const target = findItem(rootSites, targetId);

        if (!source || !target) {
          console.warn('Source or Target not found in storage', sourceId, targetId);
          return;
        }

        // remove source
        const [movedItem] = source.list.splice(source.index, 1);

        // find target index again (array might have shifted)
        // Note: target.list refers to the array. If source and target were in same array, index might change.
        const newTargetIndex = target.list.findIndex(x => x.id === targetId);
        if (newTargetIndex === -1) {
          // Fallback: put it back if something went wrong? 
          // Ideally we shouldn't lose data. push to root.
          rootSites.push(movedItem);
          chrome.storage.local.set({ savedSites: rootSites });
          return;
        }

        if (action === 'before') {
          target.list.splice(newTargetIndex, 0, movedItem);
        } else if (action === 'after') {
          target.list.splice(newTargetIndex + 1, 0, movedItem);
        } else if (action === 'group') {
          const targetItem = target.list[newTargetIndex];

          // Logic: 
          // 1. If Target IS a Group -> Add to it.
          // 2. If Target is NOT a Group -> Create New Group [Target, Source]
          // 3. Prevent Group inside Group (flatten or deny)? -> Let's flatten or deny. 

          if (targetItem.items && Array.isArray(targetItem.items)) {
            // Target is a Group.
            if (movedItem.items) {
              // Source is also a group. Merge? Or put next to it?
              // For simplicity, let's just put it AFTER to avoid nested complexity for now.
              target.list.splice(newTargetIndex + 1, 0, movedItem);
            } else {
              // Source is single item. Add to target group.
              // optionally check duplicates
              targetItem.items.push(movedItem);
              // Auto-expand group? We can't easily control UI state from here, but next render will show it.
            }
          } else {
            // Target is regular item.
            if (movedItem.items) {
              // Source is Group. Cannot put Group inside Item (makes no sense).
              // Just swap or put after.
              target.list.splice(newTargetIndex + 1, 0, movedItem);
            } else {
              // Both are single items. Create Group.
              const newGroup = {
                id: Date.now(),
                name: 'Group',
                type: 'group',
                items: [targetItem, movedItem],
                icon: ''
              };
              target.list.splice(newTargetIndex, 1, newGroup);
            }
          }
        }



        chrome.storage.local.set({ savedSites: rootSites }, () => {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { savedSites: rootSites } });
        });
      });
    }

    // --- Settings Auth Logic ---
    const authSection = settingsModal.querySelector('#sdbdh-auth-section');
    const authLoading = settingsModal.querySelector('#sdbdh-auth-loading');
    const loginBtn = settingsModal.querySelector('#sdbdh-login-btn');
    const userInfo = settingsModal.querySelector('#sdbdh-user-info');
    const userStatus = settingsModal.querySelector('#sdbdh-user-status');
    const logoutBtn = settingsModal.querySelector('#sdbdh-logout-btn');

    function updateAuthUI(status) {
      if (!authLoading) return;
      authLoading.style.display = 'none';

      if (status && status.signedIn) {
        if (userInfo) userInfo.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (userStatus) userStatus.innerText = 'Signed in as: ' + (status.email || 'User');
      } else {
        if (userInfo) userInfo.style.display = 'none';
        if (loginBtn) {
          loginBtn.style.display = 'block';
          loginBtn.innerText = 'Sign in with Google';
        }
      }
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        loginBtn.innerText = 'Signing in...';
        chrome.runtime.sendMessage({ action: 'LOGIN' }, (response) => {
          if (!response || !response.success) {
            loginBtn.innerText = 'Sign in with Google';
            alert('Login failed: ' + (response ? response.error : 'Unknown'));
          }
        });
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logoutBtn.innerText = 'Signing out...';
        chrome.runtime.sendMessage({ action: 'LOGOUT' }, (response) => {
          if (!response || !response.success) {
            logoutBtn.innerText = 'Sign Out';
            alert('Logout failed');
          }
        });
      });
    }

    // Monitor Auth Changes via Storage
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.userStatus) {
        updateAuthUI(changes.userStatus.newValue);
      }
    });

    // Check initial status when opening settings
    function openSettingsModal() {
      chrome.storage.local.get({ sidebarSide: 'right', sidebarVisibility: 'visible', clickAction: 'sidebar', userStatus: { signedIn: false } }, function (items) {
        // Auth
        updateAuthUI(items.userStatus);

        // Side
        const sideRadios = settingsModal.querySelectorAll('input[name="sdbdh-side"]');
        sideRadios.forEach(r => r.checked = r.value === items.sidebarSide);

        // Visibility
        const visRadios = settingsModal.querySelectorAll('input[name="sdbdh-visibility"]');
        visRadios.forEach(r => r.checked = r.value === items.sidebarVisibility);

        // Click Action
        const actionRadios = settingsModal.querySelectorAll('input[name="sdbdh-click-action"]');
        actionRadios.forEach(r => r.checked = r.value === items.clickAction);
      });
      openModal(settingsModal);
    }

    const settingsSideRadios = settingsModal.querySelectorAll('input[name="sdbdh-side"]');
    settingsSideRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        chrome.storage.local.set({ sidebarSide: e.target.value }, () => {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { sidebarSide: e.target.value } });
        });
      });
    });

    const settingsVisRadios = settingsModal.querySelectorAll('input[name="sdbdh-visibility"]');
    settingsVisRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        chrome.storage.local.set({ sidebarVisibility: e.target.value }, () => {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { sidebarVisibility: e.target.value } });
        });
      });
    });

    const settingsActionRadios = settingsModal.querySelectorAll('input[name="sdbdh-click-action"]');
    settingsActionRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        chrome.storage.local.set({ clickAction: e.target.value }, () => {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { clickAction: e.target.value } });
        });
      });
    });


    // Add Site Logic (Internal Modal)
    function openAddModal() {
      const nameInput = addModal.querySelector('#sdbdh-site-name');
      const urlInput = addModal.querySelector('#sdbdh-site-url');
      nameInput.value = document.title;
      urlInput.value = window.location.href;
      openModal(addModal);
    }

    const saveBtn = addModal.querySelector('#sdbdh-save-site-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveSite);

    function saveSite() {
      const nameIn = addModal.querySelector('#sdbdh-site-name');
      const urlIn = addModal.querySelector('#sdbdh-site-url');

      const name = nameIn ? nameIn.value : '';
      const url = urlIn ? urlIn.value : '';

      if (!name || !url) return;

      chrome.storage.local.get({ savedSites: [] }, function (items) {
        const sites = items.savedSites || []; // Robustness
        let domain = '';
        try {
          domain = new URL(url).hostname;
        } catch (e) {
          domain = 'example.com';
        }
        const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        sites.push({
          id: Date.now(),
          name: name,
          url: url,
          icon: iconUrl
        });

        chrome.storage.local.set({ savedSites: sites }, function () {
          chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', data: { savedSites: sites } });
          closeModal(addModal);
        });
      });
    }

    // --- Render Logic ---
    function renderSites(sites) {
      try {
        console.log('Sidebar: renderSites called with', sites ? sites.length : 0, 'sites');
        if (!appsContainer) {
          console.warn('Sidebar: appsContainer missing during render');
          return;
        }
        appsContainer.innerHTML = '';

        if (!sites) sites = [];

        // Recursive render function
        function renderItem(site, container) {
          if (!site) return;

          const isGroup = Array.isArray(site.items);

          const el = document.createElement('div');
          el.className = CLASS_ICON_BASE;
          el.dataset.id = site.id;
          el.dataset.title = site.name || (isGroup ? 'Group' : 'App');

          attachTooltipEvents(el);
          initDragEvents(el, site.id);

          // Context Menu
          el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            contextTargetId = site.id;
            contextTargetUrl = site.url || null;

            // Adjust context menu items for groups
            const openItem = contextMenu.querySelector('#sdbdh-sidebar-item');
            const visitItem = contextMenu.querySelector('#sdbdh-visit-item');
            const copyItem = contextMenu.querySelector('#sdbdh-copy-item');
            const editGroupItem = contextMenu.querySelector('#sdbdh-edit-group-item');

            // Reset all displays first
            openItem.style.display = 'flex';
            visitItem.style.display = 'flex';
            copyItem.style.display = 'flex';
            editGroupItem.style.display = 'none';

            if (isGroup) {
              openItem.style.display = 'none';
              visitItem.style.display = 'none';
              copyItem.style.display = 'none';
              editGroupItem.style.display = 'flex';
            } else {
              // Defaults are already set to flex above
            }

            contextMenu.style.top = `${e.clientY}px`;
            if (isSidebarLeft) {
              contextMenu.style.left = '50px';
              contextMenu.style.right = 'auto';
            } else {
              contextMenu.style.left = 'auto';
              contextMenu.style.right = '50px';
            }

            contextMenu.classList.add('sdbdh-show');
            hideTooltip();
          });

          if (isGroup) {
            // Render Group Icon
            const folderColor = site.color || 'currentColor';
            el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${folderColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_FOLDER_PATH}</svg>`;
            el.classList.add('sdbdh-group-icon');

            container.appendChild(el);

            // Container for children
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'sdbdh-group-items';

            // Toggle logic
            el.addEventListener('click', (e) => {
              if (e.button !== 0) return; // Only left click
              childrenContainer.classList.toggle('sdbdh-expanded');
            });

            // Render children
            site.items.forEach(child => {
              renderItem(child, childrenContainer);
            });

            container.appendChild(childrenContainer);

          } else {
            // Render Site Icon
            const img = document.createElement('img');
            img.src = site.icon || '';
            img.className = 'sdbdh-app-icon-img';
            img.draggable = false;
            el.appendChild(img);

            // Click Action
            el.addEventListener('click', (e) => {
              if (e.button !== 0) return;
              chrome.storage.local.get({ clickAction: 'sidebar' }, (items) => {
                if (items.clickAction === 'newtab') {
                  chrome.runtime.sendMessage({ action: 'open_new_tab', url: site.url });
                } else {
                  chrome.runtime.sendMessage({ action: 'open_side_panel', url: site.url });
                }
              });
            });

            container.appendChild(el);
          }
        }

        // Add Sites
        sites.forEach(site => {
          renderItem(site, appsContainer);
        });

        // Always append add button last
        appsContainer.appendChild(addBtn);

      } catch (err) {
        console.error('Sidebar: Error inside renderSites', err);
      }
    }

    // --- Initialization & Listeners ---

    chrome.storage.onChanged.addListener(function (changes, namespace) {
      console.log('Sidebar: Storage changed:', namespace, changes);
      if (changes.sidebarSide || changes.sidebarVisibility) {
        const side = changes.sidebarSide ? changes.sidebarSide.newValue : (isSidebarLeft ? 'left' : 'right');
        const vis = changes.sidebarVisibility ? changes.sidebarVisibility.newValue : currentVisibility;
        updateLayoutState(side, vis);
      }

      if (changes.savedSites) {
        console.log('Sidebar: Saved sites updated, re-rendering.');
        renderSites(changes.savedSites.newValue);
      }
    });

    // Initial Load
    chrome.storage.local.get({ savedSites: [], sidebarSide: 'right', sidebarVisibility: 'visible' }, function (items) {
      console.log('Sidebar: Initial load', items);
      updateLayoutState(items.sidebarSide, items.sidebarVisibility);
      renderSites(items.savedSites);
    });

    // Append Elements
    document.documentElement.appendChild(sidebar);
    document.documentElement.appendChild(tooltip);
    document.documentElement.appendChild(contextMenu);
    document.documentElement.appendChild(settingsModal);
    document.documentElement.appendChild(addModal);
    document.documentElement.appendChild(editGroupModal);
    document.documentElement.appendChild(hitAreaLeft);
    document.documentElement.appendChild(hitAreaRight);

  } catch (error) {
    console.error('Sidebar Extension Error (Top Level):', error);
  }
})();
