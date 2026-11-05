/* BRAND: "Ohio Stay Legal" — name decided by Stephen Legg on 2026-11-04 (state-file cross-check clean; historical registry portal blocked, residual risk accepted by him).
   Packet checklist: makes the 12-item application checklist on packet.html
   interactive. Progress is saved only in this browser's localStorage.
   No accounts, no server, nothing leaves the device. */

(function () {
  'use strict';

  var STORAGE_KEY = 'str-packet-checklist-v1';
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.item-check'));
  var progress = document.getElementById('checklist-progress');

  if (!boxes.length) {
    return;
  }

  var saved = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch (e) {
    saved = {};
  }

  function itemBox(box) {
    var node = box;
    while (node && !(node.classList && node.classList.contains('checklist-item'))) {
      node = node.parentNode;
    }
    return node;
  }

  function render() {
    var done = 0;
    boxes.forEach(function (box) {
      var wrap = itemBox(box);
      if (box.checked) {
        done += 1;
        if (wrap) { wrap.classList.add('is-done'); }
      } else if (wrap) {
        wrap.classList.remove('is-done');
      }
    });
    if (progress) {
      progress.textContent = done + ' of ' + boxes.length + ' ready';
    }
  }

  boxes.forEach(function (box) {
    var id = box.getAttribute('data-item');
    if (id && saved[id]) {
      box.checked = true;
    }
    box.addEventListener('change', function () {
      if (id) {
        saved[id] = box.checked;
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {
          /* Storage unavailable (private mode, etc.) — checklist still works for this visit. */
        }
      }
      render();
    });
  });

  render();
})();
