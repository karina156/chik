// эффект печатной машинки для слогана
const slogan = document.getElementById('slogan');
const text = 'Мы — птицы,\nи мы будем\nчирикать';
let i = 0;
let deleting = false;

function typing() {
  if (!deleting) {
    i++;
  } else {
    i--;
  }

  // переносы строк меняем на <br>
  slogan.innerHTML = text.slice(0, i).replace(/\n/g, '<br>');

  if (!deleting && i === text.length) {
    // напечатали всё, ждём и стираем
    deleting = true;
    setTimeout(typing, 2500);
    return;
  }
  if (deleting && i === 0) {
    // стерли, печатаем заново
    deleting = false;
    setTimeout(typing, 600);
    return;
  }

  if (deleting) {
    setTimeout(typing, 40);
  } else {
    setTimeout(typing, 110);
  }
}

slogan.innerHTML = '';
typing();

// пунктир и ласточка
const flight = document.getElementById('flight');
const swallowMove = document.getElementById('swallow-move');
let started = false;

// запускаем, когда блок появился на экране
const observer = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting && !started) {
    started = true;
    flight.classList.add('drawing');
    // когда линия дорисовалась, ласточка летит
    setTimeout(function () {
      flight.classList.add('flying');
      swallowMove.beginElement();
    }, 2500);
  }
}, { threshold: 0.4 });

observer.observe(flight);

// буквы chik падают, когда колонку видно
const chikCol = document.getElementById('chik-col');

const chikObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    chikCol.classList.add('falling');
    chikObserver.disconnect();
  }
}, { threshold: 0.3 });

chikObserver.observe(chikCol);

// падающие нотки
const notesBox = document.getElementById('notes-fall');
const notes = [];

document.querySelectorAll('.fall-note').forEach(function (el) {
  const note = {
    el: el,
    y: Number(el.dataset.top),          // где нотка сейчас, в % от высоты блока
    speed: 0.12 + Math.random() * 0.1,  // скорость, % за кадр
    caught: false
  };
  // ловим мышкой
  el.addEventListener('mouseenter', function () {
    note.caught = true;
    el.classList.add('caught');
  });
  el.addEventListener('mouseleave', function () {
    note.caught = false;
    el.classList.remove('caught');
  });
  notes.push(note);
});

// пересекаются ли нотки по горизонтали
// у svg нет offsetLeft, поэтому берем getBoundingClientRect
function sameColumn(a, b) {
  const ra = a.el.getBoundingClientRect();
  const rb = b.el.getBoundingClientRect();
  return ra.left < rb.right && rb.left < ra.right;
}

function fall() {
  const boxH = notesBox.offsetHeight;

  // сначала двигаем нижние, чтобы верхние упирались в них
  notes.sort(function (a, b) { return b.y - a.y; });

  notes.forEach(function (note) {
    if (note.caught) return; // пойманная стоит

    const h = note.el.getBoundingClientRect().height / boxH * 100;
    let newY = note.y + note.speed;

    // проверяем, не упираемся ли в нотку под нами
    notes.forEach(function (other) {
      if (other === note || other.y < note.y) return;
      if (!sameColumn(note, other)) return;
      // нотка снизу стоит (поймана или сама уперлась) - не проходим сквозь нее
      if (other.caught || other.stuck) {
        if (newY + h > other.y) {
          newY = Math.min(newY, other.y - h);
        }
      }
    });

    note.stuck = newY < note.y + note.speed;
    note.y = newY;

    // упала за низ - начинаем сверху
    if (note.y > 100) {
      note.y = -h - Math.random() * 20;
      note.stuck = false;
    }
    note.el.style.top = note.y + '%';
  });

  requestAnimationFrame(fall);
}

// если человек выключил анимации - нотки просто стоят
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  requestAnimationFrame(fall);
}
