
// List of selectors that should point to the filter icon / element
  const ICON_SELECTORS = [
    'prm-icon[aria-label="Filtering locations items"]',
    'prm-icon[aria-label*="Filtering locations"]',
    'prm-icon[aria-label*="filtering"]',
    'md-icon[md-svg-icon="primo-ui:filter"]',
    'md-icon[md-svg-icon*="filter"]',
    'button[aria-label*="Filter"]',
    'button[aria-label*="filter"]'
  ];

  // Inline style to apply to the button (uses setProperty with 'important')
  function applyRedStyle(btn) {
    if (!btn || btn.dataset._filterRed) return;
    btn.dataset._filterRed = '1';
    // strong red background + white icon/foreground, glowing outline
    btn.style.setProperty('background-color', '#c62828', 'important'); // red
    btn.style.setProperty('color', '#fff', 'important');
    btn.style.setProperty('border-radius', '4px', 'important');
    btn.style.setProperty('box-shadow', '0 0 8px rgba(198,40,40,0.9)', 'important');
    // if icon is an svg inside, color it (fill) if possible
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.style.setProperty('fill', '#fff', 'important');
      svg.style.setProperty('color', '#fff', 'important');
    }
  }

  // Given an element that matches an icon selector, find the appropriate button and style it
  function handleIconElement(el) {
    if (!el) return;
    // if the element itself is a button, use it, otherwise find closest button
    const btn = el.tagName && el.tagName.toLowerCase() === 'button' ? el : el.closest('button');
    if (btn) applyRedStyle(btn);
  }

  // Check the whole document for any existing matches (run on load)
  function scanExisting() {
    ICON_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(handleIconElement);
    });
  }

  // MutationObserver callback: check added nodes for matches (and the node itself)
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      // check added nodes quickly
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        // if the added node itself matches a selector
        for (const sel of ICON_SELECTORS) {
          try {
            if (node.matches && node.matches(sel)) {
              handleIconElement(node);
            }
          } catch (e) {
            // ignore invalid selector matches errors in older browsers
          }
          // query inside the added subtree
          const found = node.querySelectorAll ? node.querySelectorAll(sel) : [];
          for (const f of found) handleIconElement(f);
        }
      }
      // small optimization: if attributes changed on existing node, re-scan its subtree
      if (m.type === 'attributes' && m.target instanceof HTMLElement) {
        const t = m.target;
        for (const sel of ICON_SELECTORS) {
          if (t.matches && t.matches(sel)) handleIconElement(t);
          const found = t.querySelectorAll ? t.querySelectorAll(sel) : [];
          for (const f of found) handleIconElement(f);
        }
      }
    }
  });

  // Start observing body for new nodes/attribute changes
  mo.observe(document.body, { childList: true, subtree: true, attributes: true });

  // initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanExisting);
  } else {
    scanExisting();
  }

  // expose a small helper to undo styling (in console) if needed
  window.__primoFilterColorHelpers = {
    resetAll: function () {
      document.querySelectorAll('button[data-_filter-red="1"]').forEach(btn => {
        btn.style.removeProperty('background-color');
        btn.style.removeProperty('color');
        btn.style.removeProperty('border-radius');
        btn.style.removeProperty('box-shadow');
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.removeProperty('fill');
          svg.style.removeProperty('color');
        }
        delete btn.dataset._filterRed;
      });
    },
    scanNow: scanExisting
  };