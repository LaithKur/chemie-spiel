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
  const inputs = card.querySelectorAll('.card-input');
  let allCorrect = true;

  inputs.forEach(input => {
    const userAnswer = input.value.trim();
    const correctAnswer = input.getAttribute('data-correct');

    // إزالة رمز الاستفهام السابق لهذا الحقل فقط
    const existingHint = input.parentElement.querySelector('.hint-wrapper');
    if (existingHint) existingHint.remove();

    if (userAnswer === correctAnswer) {
      input.style.backgroundColor = '#a7f3d0'; // أخضر فاتح
      input.disabled = true;
    } else {
      input.style.backgroundColor = '#fecaca'; // أحمر فاتح
      input.disabled = false;
      allCorrect = false;

      const hintWrapper = document.createElement('span');
      hintWrapper.className = 'hint-wrapper';
      hintWrapper.style.position = 'relative';
      hintWrapper.style.marginright = '5px';

      const questionMark = document.createElement('span');
      questionMark.textContent = '?';
      questionMark.style.cursor = 'help';
      questionMark.style.color = 'red';
      questionMark.style.position = 'absolute';
      questionMark.style.fontWeight = 'bold';
      questionMark.style.right = '0';
      questionMark.style.top = '-1.5px';
      questionMark.style.fontSize = '6px'; // كبرنا الحجم

      const answerHint = document.createElement('span');
      answerHint.textContent = correctAnswer;
      answerHint.style.display = 'none';
      answerHint.style.position = 'absolute';
      answerHint.style.right = '-4px';
      answerHint.style.top = '-10px';
      answerHint.style.fontSize = '3px'; // أكبر قليلاً ليتضح
      answerHint.style.backgroundColor = '#fef2f2';
      answerHint.style.padding = '2px 4px';
      answerHint.style.borderRadius = '4px';
      answerHint.style.border = '1px solid #fca5a5';
      answerHint.style.whiteSpace = 'nowrap';
      answerHint.style.zIndex = '10'; 

      questionMark.addEventListener('mouseenter', () => {
        answerHint.style.display = 'block';
      });
      questionMark.addEventListener('mouseleave', () => {
        answerHint.style.display = 'none';
      });

      hintWrapper.appendChild(questionMark);
      hintWrapper.appendChild(answerHint);
      input.parentElement.appendChild(hintWrapper);
    }
  });

  if (allCorrect) {
    if (!card.querySelector('.close-button')) {
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Schließen';
      closeButton.className = 'close-button';
      closeButton.onclick = function (e) {
        e.stopPropagation();
        moveToDone(card);
      };
      card.appendChild(closeButton);
    }
  }
}



function moveToDone(card) {
  const doneContainer = document.getElementById('done-container');
  if (!doneContainer) {
    alert('لم يتم العثور على الحاوية #done-container');
    return;
  }

  // إزالة التكبير والتدوير
  card.classList.remove('zoomed');
  card.querySelector('.card').classList.remove('flipped');

  // إزالة زر الإغلاق
  const closeButton = card.querySelector('.close-button');
  if (closeButton) closeButton.remove();

  // إخفاء زر "تحقق"
  const checkButton = card.querySelector('button');
  if (checkButton) checkButton.style.display = 'none';

  // إزالة موضع البطاقة القديم
  card.style.position = 'static';
  card.style.transform = 'none';

  // إعادة تعيين الحجم داخل الحاوية
  card.style.width = '50px';
  card.style.height = '100px';

  doneContainer.appendChild(card);

  // إزالة خاصية التكبير نهائياً
  card.onclick = null;

  flippedCard = null;
}

// عند الضغط على بطاقة في done-container، تكبر في الوسط
document.getElementById('done-container').addEventListener('click', function (e) {
  const cardContainer = e.target.closest('.container');
  if (!cardContainer || flippedCard !== null) return;

  const card = cardContainer.querySelector('.card');

  // أضف التكبير والتدوير
  cardContainer.classList.add('zoomed');
  card.classList.add('flipped');
  flippedCard = cardContainer;

  // جعل البطاقة في وسط الصفحة
  cardContainer.style.position = 'fixed';
  cardContainer.style.top = '50%';
  cardContainer.style.left = '50%';
  cardContainer.style.transform = 'translate(-50%, -50%) scale(5)';
  cardContainer.style.zIndex = '1000'; // تأكد من أن البطاقة تظهر فوق العناصر الأخرى

  // أضف زر الإغلاق مجددًا إذا لم يكن موجودًا
  if (!cardContainer.querySelector('.close-button')) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Schließen';
    closeButton.className = 'close-button';
    closeButton.onclick = function (e) {
      e.stopPropagation();
      moveToDone(cardContainer);
    };
    cardContainer.appendChild(closeButton);
  }
});


document.querySelectorAll('.card-input').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});



