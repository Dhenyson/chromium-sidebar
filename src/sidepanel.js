
document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('content-frame');
  const header = document.getElementById('header');
  const title = document.getElementById('title');
  const emptyState = document.getElementById('empty-state');
  const openExtBtn = document.getElementById('open-ext-btn');

  function updateContent(url) {
    if (!url) {
      iframe.style.display = 'none';
      header.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    iframe.src = url;
    iframe.style.display = 'block';
    header.style.display = 'flex';
    title.textContent = url;

    openExtBtn.onclick = () => {
      window.open(url, '_blank');
    };
  }

  // Load initial state
  chrome.storage.local.get(['sidePanelUrl'], (result) => {
    updateContent(result.sidePanelUrl);
  });

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.sidePanelUrl) {
      updateContent(changes.sidePanelUrl.newValue);
    }
  });
});
