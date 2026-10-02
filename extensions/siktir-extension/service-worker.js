chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'siktir-selection', title: 'Send selection to Siktir', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'siktir-link', title: 'Send link to Siktir', contexts: ['link'] });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const payload = { text: info.selectionText || tab?.title || 'Saved link', url: info.linkUrl || info.pageUrl || tab?.url || '' };
  const { apiBase = 'http://localhost:5000/api', token = '' } = await chrome.storage.sync.get(['apiBase', 'token']);
  if (!token) return;
  await fetch(`${apiBase.replace(/\/$/,'')}/apps/siktir-extension/records`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify({data:payload}) });
});
