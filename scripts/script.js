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
    setTimeout(typing, 1000);
    return;
  }
  if (deleting && i === 0) {
    // стерли, печатаем заново
    deleting = false;
    setTimeout(typing, 260);
    return;
  }

  if (deleting) {
    setTimeout(typing, 16);
  } else {
    setTimeout(typing, 45);
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
    }, 1055);
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
    speed: 0.28 + Math.random() * 0.22,  // скорость, % за кадр
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
    let blocked = false;

    // упираемся только в пойманную нотку или в ту, что уже на ней стоит
    notes.forEach(function (other) {
      if (other === note) return;
      if (!other.caught && !other.stuck) return;
      if (!sameColumn(note, other)) return;
      // нотка должна быть над другой, а не уже внутри нее
      if (note.y + h <= other.y + 0.5 && newY + h > other.y) {
        newY = other.y - h;
        blocked = true;
      }
    });

    note.stuck = blocked;
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

// надпись chik резко появляется из маленькой
const chikBox = document.querySelector('.chik-box');

const chikBoxObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    chikBox.classList.add('popped');
    chikBoxObserver.disconnect();
  }
}, { threshold: 0.5 });

chikBoxObserver.observe(chikBox);

// звездочки справа двигаются за курсором
const rightBlock = document.querySelector('.right-3');
const rightStars = rightBlock.querySelectorAll('.sparkle');

rightBlock.addEventListener('mousemove', function (e) {
  const rect = rightBlock.getBoundingClientRect();
  // где курсор относительно центра блока, от -1 до 1
  const mx = (e.clientX - rect.left) / rect.width * 2 - 1;
  const my = (e.clientY - rect.top) / rect.height * 2 - 1;

  rightStars.forEach(function (star, i) {
    // у каждой звезды своя сила, четные бегут от курсора, нечетные к нему
    const power = (i + 2) * 0.8;
    const side = i % 2 === 0 ? -1 : 1;
    const x = mx * power * side;
    const y = my * power * side;
    // translate отдельно от transform, чтобы не ломать флип
    star.style.translate = x + 'vw ' + y + 'vw';
  });
});

rightBlock.addEventListener('mouseleave', function () {
  rightStars.forEach(function (star) {
    star.style.translate = '0 0';
  });
});

// ---------------------------------------------------------
// общие штуки
const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------
// БЕГУЩАЯ СТРОКА
const marquee = document.querySelector('.marquee');
const track = document.querySelector('.marquee__track');

// режем текст на буквы, чтобы они прыгали волной
let letterIndex = 0;
track.querySelectorAll('span').forEach(function (span) {
  const text = span.textContent;
  span.textContent = '';
  for (const ch of text) {
    const letter = document.createElement('span');
    letter.className = 'ltr';
    letter.textContent = ch;
    letter.style.setProperty('--i', letterIndex % 20);
    letterIndex++;
    span.appendChild(letter);
  }
});

let marqueeX = 0;
let marqueeHover = false;
let marqueeSpeed = 1;   // 1 - обычная скорость, при наведении меньше
let scrollBoost = 0;    // добавка от скролла
let lastScroll = window.scrollY;
let lastTime = performance.now();

marquee.addEventListener('mouseenter', function () { marqueeHover = true; });
marquee.addEventListener('mouseleave', function () { marqueeHover = false; });

window.addEventListener('scroll', function () {
  const delta = window.scrollY - lastScroll;
  lastScroll = window.scrollY;
  // вниз - быстрее, вверх - едет в обратную сторону
  scrollBoost += delta * 0.004;
  scrollBoost = Math.max(-3, Math.min(3, scrollBoost));
}, { passive: true });

function runMarquee(now) {
  const dt = Math.min(now - lastTime, 50);
  lastTime = now;
  const half = track.scrollWidth / 2;
  const base = half / 6760; // как было в css: половина строки за 6.76с

  const target = marqueeHover ? 0.2 : 1;
  marqueeSpeed += (target - marqueeSpeed) * 0.08; // плавно тормозим
  const v = base * marqueeSpeed + scrollBoost;
  scrollBoost *= 0.93; // скролл кончился - добавка затухает

  marqueeX -= v * dt;
  if (marqueeX <= -half) marqueeX += half;
  if (marqueeX > 0) marqueeX -= half;
  track.style.transform = 'translateX(' + marqueeX + 'px)';
  requestAnimationFrame(runMarquee);
}
if (!noMotion) requestAnimationFrame(runMarquee);

// ---------------------------------------------------------
// ПОПУГАЙ ЧИРИКАЕТ
const parrot = document.querySelector('.parrot');
const right1 = document.querySelector('.right-1');
const beakNotes = ['note-1', 'note-2', 'note-5', 'note-6', 'note-7'];

parrot.addEventListener('click', function () {
  // перезапускаем прыжок
  parrot.classList.remove('chirp');
  void parrot.offsetWidth;
  parrot.classList.add('chirp');

  // где клюв
  const p = parrot.getBoundingClientRect();
  const box = right1.getBoundingClientRect();
  const beakX = p.left + p.width * 0.3 - box.left;
  const beakY = p.top + p.height * 0.15 - box.top;

  for (let i = 0; i < 6; i++) {
    const n = document.createElement('img');
    n.src = '../chik/images/' + beakNotes[i % beakNotes.length] + '.svg';
    n.className = 'beak-note';
    n.alt = '';
    n.style.left = beakX + 'px';
    n.style.top = beakY + 'px';
    n.style.setProperty('--dx', (Math.random() * 16 - 12) + 'vw');
    n.style.setProperty('--dy', (-8 - Math.random() * 14) + 'vw');
    n.style.setProperty('--rot', (Math.random() * 120 - 60) + 'deg');
    n.style.animationDelay = (i * 0.06) + 's';
    n.addEventListener('animationend', function () { n.remove(); });
    right1.appendChild(n);
  }
});

// ---------------------------------------------------------
// БОЛЬШАЯ ЗВЕЗДА СМОТРИТ НА КУРСОР
const bigStar = document.querySelector('.star');
let starAngle = 0;
let starTarget = 0;

document.addEventListener('mousemove', function (e) {
  const r = bigStar.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  starTarget = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
});

function turnStar() {
  // самый короткий поворот
  let diff = starTarget - starAngle;
  diff = ((diff + 540) % 360) - 180;
  starAngle += diff * 0.03; // медленно
  bigStar.style.rotate = starAngle + 'deg';
  requestAnimationFrame(turnStar);
}
if (!noMotion) requestAnimationFrame(turnStar);

// ---------------------------------------------------------
// ПТИЦА КРИЧИТ СИЛЬНЕЕ, ВОЛНЫ КАК ЭКВАЛАЙЗЕР
const left2 = document.querySelector('.left-2');
const waves = left2.querySelectorAll('.wave');

left2.addEventListener('click', function (e) {
  const r = left2.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  // сверху большая птица, снизу маленькая
  const bird = left2.querySelector(y < 0.55 ? '.bird-big' : '.bird-small');

  bird.animate([
    { rotate: '0deg', scale: '1' },
    { rotate: '-10deg', scale: '1.08' },
    { rotate: '-4deg', scale: '1.04' },
    { rotate: '-12deg', scale: '1.1' },
    { rotate: '0deg', scale: '1' }
  ], { duration: 700, easing: 'ease-in-out' });

  waves.forEach(function (wave, i) {
    wave.animate([
      { scale: '1 1' },
      { scale: '1 1.35' },
      { scale: '1 0.9' },
      { scale: '1 1.2' },
      { scale: '1 1' }
    ], { duration: 600, delay: i * 60, easing: 'ease-in-out' });
  });
});

// ---------------------------------------------------------
// ИМЯ В ПОДВАЛЕ ПЕЧАТАЕТСЯ
const footerName = document.getElementById('footer-name');
const nameText = footerName.textContent;

const footerObserver = new IntersectionObserver(function (entries) {
  if (!entries[0].isIntersecting) return;
  footerObserver.disconnect();
  if (noMotion) return;
  let k = 0;
  footerName.textContent = '';
  footerName.classList.add('typing');
  const timer = setInterval(function () {
    k++;
    footerName.textContent = nameText.slice(0, k);
    if (k >= nameText.length) {
      clearInterval(timer);
      setTimeout(function () { footerName.classList.remove('typing'); }, 1200);
    }
  }, 70);
}, { threshold: 0.5 });
footerObserver.observe(document.querySelector('.footer'));

// ---------------------------------------------------------
// ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ
// классы ставим скриптом: если js не загрузится, сайт все равно будет виден
const revealList = [
  ['.left-1', 'reveal-left'], ['.right-1', 'reveal-right'],
  ['.left-2', 'reveal-right'], ['.right-2', 'reveal-left'],
  ['.left-3', 'reveal-left'], ['.right-3', 'reveal-right'],
  ['.footer-student', 'reveal-up'], ['.footer-curators', 'reveal-up']
];

if (!noMotion) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('shown');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealList.forEach(function (item) {
    const el = document.querySelector(item[0]);
    el.classList.add('reveal', item[1]);
    revealObserver.observe(el);
  });
}

// ---------------------------------------------------------
// СЛЕД ИЗ НОТОК ЗА КУРСОРОМ
if (!noMotion && window.matchMedia('(pointer: fine)').matches) {
  let trailX = 0;
  let trailY = 0;
  document.addEventListener('mousemove', function (e) {
    const dx = e.clientX - trailX;
    const dy = e.clientY - trailY;
    if (dx * dx + dy * dy < 40 * 40) return; // не чаще чем раз в 40px
    trailX = e.clientX;
    trailY = e.clientY;
    const t = document.createElement('img');
    t.src = '../chik/images/cursor-note.svg';
    t.className = 'trail-note';
    t.alt = '';
    t.style.left = e.clientX + 'px';
    t.style.top = e.clientY + 'px';
    t.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
    t.addEventListener('animationend', function () { t.remove(); });
    document.body.appendChild(t);
  });
}
