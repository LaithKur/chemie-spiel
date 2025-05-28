let flippedCard = null;

function flipAndZoom(container) {
  if (flippedCard !== null) return;
  const card = container.querySelector('.card');
  container.classList.add('zoomed');
  card.classList.add('flipped');
  flippedCard = container;
}

function shuffleCards() {
  const container = document.getElementById('cards-container');
  const cards = Array.from(container.children).filter(child => child.classList.contains('container'));
  const shuffled = cards.sort(() => Math.random() - 0.5);
  shuffled.forEach(card => container.appendChild(card));
}

function prüfen(button) {
  const card = button.closest('.container');
  const inputs = Array.from(card.querySelectorAll('.card-input'));

  const correctAnswers = inputs.map(input => input.getAttribute('data-correct').trim());
  const usedAnswers = new Set();
  const userInputs = inputs.map(input => input.value.trim());

  const isStrict = card.getAttribute('data-strict') === 'true'; // <-- التحقق من data-strict

  // Reset input states
  inputs.forEach(input => {
    const existingHint = input.parentElement.querySelector('.hint-wrapper');
    if (existingHint) existingHint.remove();
    input.style.backgroundColor = '';
  });

  // Check answers
  userInputs.forEach((userAnswer, inputIndex) => {
    let matched = false;

    if (isStrict) {
      // تطابق حسب الترتيب
      if (userAnswer === correctAnswers[inputIndex]) {
        usedAnswers.add(inputIndex);
        inputs[inputIndex].style.backgroundColor = '#a7f3d0'; // Green
        inputs[inputIndex].disabled = true;
        matched = true;
      }
    } else {
      // تطابق غير مرتب
      for (let correctIndex = 0; correctIndex < correctAnswers.length; correctIndex++) {
        if (userAnswer === correctAnswers[correctIndex] && !usedAnswers.has(correctIndex)) {
          usedAnswers.add(correctIndex);
          inputs[inputIndex].style.backgroundColor = '#a7f3d0'; // Green
          inputs[inputIndex].disabled = true;
          matched = true;
          break;
        }
      }
    }

    if (!matched && userAnswer !== '') {
      inputs[inputIndex].style.backgroundColor = '#fecaca'; // Red
    }
  });

  // Show "?" for unused correct answers
  correctAnswers.forEach((correctAnswer, i) => {
    if (!usedAnswers.has(i)) {
      const input = inputs[i];
      const hintWrapper = document.createElement('span');
      hintWrapper.className = 'hint-wrapper';
      hintWrapper.style.position = 'relative';
      hintWrapper.style.marginRight = '5px';

      const questionMark = document.createElement('span');
      questionMark.textContent = '?';
      questionMark.style.cssText = `
        cursor: help;
        color: red;
        position: absolute;
        font-weight: bold;
        right: 0;
        top: -1.5px;
        font-size: 6px;
      `;

      const answerHint = document.createElement('span');
      answerHint.textContent = correctAnswer;
      answerHint.style.cssText = `
        display: none;
        position: absolute;
        right: -4px;
        top: -10px;
        font-size: 3px;
        background-color: #fef2f2;
        padding: 2px 4px;
        border-radius: 4px;
        border: 1px solid #fca5a5;
        white-space: nowrap;
        z-index: 10;
      `;

      questionMark.addEventListener('mouseenter', () => answerHint.style.display = 'block');
      questionMark.addEventListener('mouseleave', () => answerHint.style.display = 'none');

      hintWrapper.appendChild(questionMark);
      hintWrapper.appendChild(answerHint);
      input.parentElement.appendChild(hintWrapper);
    }
  });

  // Show close button if all answers correct
  if (usedAnswers.size === correctAnswers.length && !card.querySelector('.close-button')) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Schließen';
    closeButton.className = 'close-button';
    closeButton.onclick = (e) => {
      e.stopPropagation();
      moveToDone(card);
    };
    card.appendChild(closeButton);
  }
}


function moveToDone(card) {
  const doneContainer = document.getElementById('done-container');
  if (!doneContainer) return alert('لم يتم العثور على الحاوية #done-container');

  card.classList.remove('zoomed');
  card.querySelector('.card').classList.remove('flipped');

  const closeButton = card.querySelector('.close-button');
  if (closeButton) closeButton.remove();

  const checkButton = card.querySelector('button');
  if (checkButton) checkButton.style.display = 'none';

  card.style.cssText = `
    position: static;
    transform: none;
    width: 50px;
    height: 100px;
  `;

  card.onclick = null;
  flippedCard = null;
  doneContainer.appendChild(card);
}

document.getElementById('done-container').addEventListener('click', function (e) {
  const cardContainer = e.target.closest('.container');
  if (!cardContainer || flippedCard !== null) return;

  const card = cardContainer.querySelector('.card');
  cardContainer.classList.add('zoomed');
  card.classList.add('flipped');
  flippedCard = cardContainer;

  cardContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(5);
    z-index: 1000;
  `;

  if (!cardContainer.querySelector('.close-button')) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Schließen';
    closeButton.className = 'close-button';
    closeButton.onclick = (e) => {
      e.stopPropagation();
      moveToDone(cardContainer);
    };
    cardContainer.appendChild(closeButton);
  }
});

// Autocomplete off
document.querySelectorAll('.card-input').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});

// Tooltip for card input
document.querySelectorAll('.card-input').forEach(input => {
  const tooltip = document.createElement('div');
  Object.assign(tooltip.style, {
    position: 'absolute',
    background: '#333',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s',
    zIndex: '1000'
  });
  document.body.appendChild(tooltip);

  input.addEventListener('mouseenter', () => {
    tooltip.textContent = input.value;
    const rect = input.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 30 + window.scrollY}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.opacity = '1';
  });

  input.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });

  input.addEventListener('input', () => {
    tooltip.textContent = input.value;
  });
});
