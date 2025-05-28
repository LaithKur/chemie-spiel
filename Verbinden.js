const container = document.getElementById('container');
const boxes = Array.from(container.querySelectorAll('.box'));
const linked = new Map();
const stickers = new Map();

function randomPosition(box) {
  const cRect = container.getBoundingClientRect();
  const maxX = cRect.width - box.offsetWidth;
  const maxY = cRect.height - box.offsetHeight - 50;
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);
  box.style.left = x + 'px';
  box.style.top = y + 'px';
}

boxes.forEach(randomPosition);

boxes.forEach(box => {
  let offsetX, offsetY;

  function startDrag(x, y) {
    offsetX = x - box.offsetLeft;
    offsetY = y - box.offsetTop;
  }

  function moveDrag(x, y) {
    const cRect = container.getBoundingClientRect();
    let newX = x - offsetX;
    let newY = y - offsetY;
    newX = Math.max(0, Math.min(newX, cRect.width - box.offsetWidth));
    newY = Math.max(0, Math.min(newY, cRect.height - box.offsetHeight - 50));
    box.style.left = newX + 'px';
    box.style.top = newY + 'px';

    if (linked.has(box)) {
      const other = linked.get(box);
      other.style.left = newX + 'px';
      other.style.top = (newY + box.offsetHeight + 5) + 'px';
      updateStickerPosition(box, other);
    } else if ([...linked.values()].includes(box)) {
      const first = [...linked.entries()].find(([k, v]) => v === box)[0];
      first.style.left = newX + 'px';
      first.style.top = (newY - first.offsetHeight - 5) + 'px';
      updateStickerPosition(first, box);
    }
  }

  // Mouse Events
  box.onmousedown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    function mouseMoveHandler(e) {
      moveDrag(e.clientX, e.clientY);
    }
    function mouseUpHandler() {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      checkAndLink(box);
    }
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  // Touch Events
  box.ontouchstart = (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    function touchMoveHandler(e) {
      e.preventDefault();
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    }
    function touchEndHandler() {
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
      checkAndLink(box);
    }
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler);
  };

  // Double click to unlink
  box.ondblclick = () => {
    if (linked.has(box)) {
      const other = linked.get(box);
      removeLink(box, other);
    } else {
      const entry = [...linked.entries()].find(([k, v]) => v === box);
      if (entry) {
        const [q, a] = entry;
        removeLink(q, a);
      }
    }
  };
});

function arePositionsClose(a, b) {
  const Width = a.offsetWidth / 2;
  const Height = a.offsetHeight / 2;
  return (
    Math.abs(a.offsetLeft - b.offsetLeft) < Width &&
    Math.abs(a.offsetTop - b.offsetTop) < Height
  );
}

function checkAndLink(movedBox) {
  if (linked.has(movedBox) || [...linked.values()].includes(movedBox)) return;

  for (const other of boxes) {
    if (other === movedBox || movedBox.dataset.type === other.dataset.type) continue;

    if (arePositionsClose(movedBox, other)) {
      movedBox.style.zIndex = 100;
      other.style.zIndex = 99;
      other.style.left = movedBox.style.left;
      other.style.top = (movedBox.offsetTop + movedBox.offsetHeight + 5) + 'px';
      linked.set(movedBox, other);
      createSticker(movedBox, other);
      break;
    }
  }
}

function createSticker(box1, box2) {
  const pairId = getPairId(box1, box2);
  if (stickers.has(pairId)) return;
  const sticker = document.createElement('div');
  sticker.className = 'sticker';
  sticker.textContent = '↕';
  container.appendChild(sticker);
  stickers.set(pairId, sticker);
  updateStickerPosition(box1, box2);
}

function updateStickerPosition(box1, box2) {
  const pairId = getPairId(box1, box2);
  if (!stickers.has(pairId)) return;
  const sticker = stickers.get(pairId);
  const x = box1.offsetLeft + (box1.offsetWidth / 2) - (sticker.offsetWidth / 2);
  const y = box1.offsetTop + box1.offsetHeight + 2;
  sticker.style.left = x + 'px';
  sticker.style.top = y + 'px';
}

function removeLink(box1, box2) {
  const pairId = getPairId(box1, box2);
  if (linked.has(box1)) linked.delete(box1);
  else {
    const entry = [...linked.entries()].find(([k, v]) => k === box2 && v === box1);
    if (entry) linked.delete(entry[0]);
  }
  if (stickers.has(pairId)) {
    stickers.get(pairId).remove();
    stickers.delete(pairId);
  }
  box1.style.borderColor = '#333';
  box2.style.borderColor = '#333';
}

function getPairId(a, b) {
  const id1 = boxes.indexOf(a);
  const id2 = boxes.indexOf(b);
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

document.getElementById('verify').onclick = () => {
  linked.forEach((b, a) => {
    const correct = a.dataset.id === b.dataset.id;
    a.style.borderColor = correct ? 'green' : 'red';
    b.style.borderColor = correct ? 'green' : 'red';
  });
};
