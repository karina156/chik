// если в системе выключены анимации, ничего не двигаем
const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* БЕГУЩАЯ СТРОКА */
const marquee = document.querySelector('.marquee');
const track = document.querySelector('.marquee__track');

// делим текст на буквы чтобы они прыгали волной
let letterIndex = 0;
track.querySelectorAll('span').forEach(function (span) {
  const words = span.textContent;
  span.textContent = '';
  for (const ch of words) {
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
let marqueeSpeed = 1;
let scrollBoost = 0;
let lastScroll = window.scrollY;
let lastTime = performance.now();

marquee.addEventListener('mouseenter', function () {
  marqueeHover = true;
});
marquee.addEventListener('mouseleave', function () {
  marqueeHover = false;
});

// скролл вниз - быстрее, вверх - едет обратно
window.addEventListener('scroll', function () {
  const delta = window.scrollY - lastScroll;
  lastScroll = window.scrollY;
  scrollBoost += delta * 0.004;
  scrollBoost = Math.max(-3, Math.min(3, scrollBoost));
});

function runMarquee(now) {
  const dt = Math.min(now - lastTime, 50);
  lastTime = now;
  const half = track.scrollWidth / 2;
  const base = half / 6760;

  // при наведении тормозит
  if (marqueeHover) {
    marqueeSpeed += (0.2 - marqueeSpeed) * 0.08;
  } else {
    marqueeSpeed += (1 - marqueeSpeed) * 0.08;
  }
  const v = base * marqueeSpeed + scrollBoost;
  scrollBoost = scrollBoost * 0.93;

  marqueeX -= v * dt;
  if (marqueeX <= -half) {
    marqueeX += half;
  }
  if (marqueeX > 0) {
    marqueeX -= half;
  }
  track.style.transform = 'translateX(' + marqueeX + 'px)';
  requestAnimationFrame(runMarquee);
}

if (!noMotion) {
  requestAnimationFrame(runMarquee);
}

/* ЭКРАН 1 */
// попугай чирикает по клику
const parrot = document.querySelector('.parrot');
const right1 = document.querySelector('.right-1');
const beakNotes = ['note-1', 'note-2', 'note-5', 'note-6', 'note-7'];

parrot.addEventListener('click', function () {
  parrot.classList.remove('chirp');
  void parrot.offsetWidth;
  parrot.classList.add('chirp');

  // клюв
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
    n.addEventListener('animationend', function () {
      n.remove();
    });
    right1.appendChild(n);
  }
});

// голова попугая смотрит на мышку, если мышка стоит - моргает
const parrotHead = document.querySelector('.parrot-head');
const eyelid = document.querySelector('.eyelid');
let idleTimer = null;
let blinkTimer = null;

function blink() {
  eyelid.classList.remove('blink');
  void eyelid.offsetWidth;
  eyelid.classList.add('blink');
}

// большая звезда поворачивается за мышкой
const bigStar = document.querySelector('.star');
let starAngle = 0;
let starTarget = 0;

document.addEventListener('mousemove', function (e) {
  if (noMotion) {
    return;
  }

  const head = parrotHead.getBoundingClientRect();
  const hx = head.left + head.width * 0.48;
  const hy = head.top + head.height * 0.13;
  let angle = (e.clientX - hx) / (window.innerWidth / 2) * 15;
  if (e.clientX < hx) {
    angle -= (e.clientY - hy) / (window.innerHeight / 2) * 6;
  } else {
    angle += (e.clientY - hy) / (window.innerHeight / 2) * 6;
  }
  angle = Math.max(-15, Math.min(15, angle));
  parrotHead.style.rotate = angle + 'deg';

  clearTimeout(idleTimer);
  clearInterval(blinkTimer);
  idleTimer = setTimeout(function () {
    blink();
    blinkTimer = setInterval(blink, 1800);
  }, 1200);

  const star = bigStar.getBoundingClientRect();
  const sx = star.left + star.width / 2;
  const sy = star.top + star.height / 2;
  starTarget = Math.atan2(e.clientY - sy, e.clientX - sx) * 180 / Math.PI;
});

function turnStar() {
  let diff = starTarget - starAngle;
  diff = ((diff + 540) % 360) - 180;
  starAngle += diff * 0.03;
  bigStar.style.rotate = starAngle + 'deg';
  requestAnimationFrame(turnStar);
}

if (!noMotion) {
  requestAnimationFrame(turnStar);
}

/* ЭКРАН 2 */
// слоган печатается
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

  slogan.innerHTML = text.slice(0, i).replace(/\n/g, '<br>');

  // напечатали - ждем и стираем
  if (!deleting && i === text.length) {
    deleting = true;
    setTimeout(typing, 1000);
    return;
  }
  // стерли - печатаем заново
  if (deleting && i === 0) {
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

// птицы и волны
const left2 = document.querySelector('.left-2');
const waves = left2.querySelectorAll('.wave');
const birdBig = left2.querySelector('.bird-big');
const birdSmall = left2.querySelector('.bird-small');

// птицы выныривают из волн
if (!noMotion) {
  left2.classList.add('js-birds');
  const birdsObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      left2.classList.add('birds-up');
      birdsObserver.disconnect();
    }
  }, { threshold: 0.4 });
  birdsObserver.observe(left2);
}

// сверху большая птица, снизу маленькая
left2.addEventListener('mousemove', function (e) {
  const r = left2.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  birdBig.classList.toggle('lit', y < 0.55);
  birdSmall.classList.toggle('lit', y >= 0.55);
});

left2.addEventListener('mouseleave', function () {
  birdBig.classList.remove('lit');
  birdSmall.classList.remove('lit');
});

// по клику птица кричит сильнее, а волны прыгают
left2.addEventListener('click', function (e) {
  const r = left2.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  let bird = birdSmall;
  if (y < 0.55) {
    bird = birdBig;
  }

  bird.animate([
    { rotate: '0deg', scale: '1' },
    { rotate: '-10deg', scale: '1.08' },
    { rotate: '-4deg', scale: '1.04' },
    { rotate: '-12deg', scale: '1.1' },
    { rotate: '0deg', scale: '1' }
  ], { duration: 700, easing: 'ease-in-out' });

  waves.forEach(function (wave, k) {
    wave.animate([
      { scale: '1 1' },
      { scale: '1 1.35' },
      { scale: '1 0.9' },
      { scale: '1 1.2' },
      { scale: '1 1' }
    ], { duration: 600, delay: k * 60, easing: 'ease-in-out' });
  });
});

// ласточка рисует пунктир и летает по нему
const flight = document.getElementById('flight');
const drawLine = flight.querySelector('.draw-line');
const swallow = flight.querySelector('.swallow');
const lineLength = drawLine.getTotalLength();
const passTime = 1700;
let started = false;
let flightStart = 0;

function fly(now) {
  if (!flightStart) {
    flightStart = now;
  }
  const k = ((now - flightStart) / passTime) % 2;
  let pos = k;
  if (k > 1) {
    pos = 2 - k;
  }

  // первый раз линия рисуется за ласточкой
  if (now - flightStart < passTime) {
    drawLine.style.strokeDashoffset = 1 - pos;
  } else {
    drawLine.style.strokeDashoffset = 0;
  }

  const point = drawLine.getPointAtLength(pos * lineLength);
  swallow.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ')');
  requestAnimationFrame(fly);
}

const observer = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting && !started) {
    started = true;
    flight.classList.add('flying');
    if (noMotion) {
      drawLine.style.strokeDashoffset = 0;
    } else {
      requestAnimationFrame(fly);
    }
  }
}, { threshold: 0.4 });

observer.observe(flight);

/* ЭКРАН 3 */
// надпись chik вырастает
const chikBox = document.querySelector('.chik-box');

const chikBoxObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    chikBox.classList.add('popped');
    chikBoxObserver.disconnect();
  }
}, { threshold: 0.5 });

chikBoxObserver.observe(chikBox);

// падающие нотки, их можно поймать мышкой
const notesBox = document.getElementById('notes-fall');
const notes = [];

document.querySelectorAll('.fall-note').forEach(function (el) {
  const note = {
    el: el,
    y: Number(el.dataset.top),
    speed: 0.28 + Math.random() * 0.22,
    caught: false
  };
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

// нотки друг над другом или нет
function sameColumn(a, b) {
  const ra = a.el.getBoundingClientRect();
  const rb = b.el.getBoundingClientRect();
  return ra.left < rb.right && rb.left < ra.right;
}

function fall() {
  const boxH = notesBox.offsetHeight;

  // сначала нижние
  notes.sort(function (a, b) {
    return b.y - a.y;
  });

  notes.forEach(function (note) {
    if (note.caught) {
      return;
    }

    const h = note.el.getBoundingClientRect().height / boxH * 100;
    let newY = note.y + note.speed;
    let blocked = false;

    // упираемся в пойманную нотку или в ту что на ней стоит
    notes.forEach(function (other) {
      if (other === note) {
        return;
      }
      if (!other.caught && !other.stuck) {
        return;
      }
      if (!sameColumn(note, other)) {
        return;
      }
      if (note.y + h <= other.y + 0.5 && newY + h > other.y) {
        newY = other.y - h;
        blocked = true;
      }
    });

    note.stuck = blocked;
    note.y = newY;

    // упала вниз - снова сверху
    if (note.y > 100) {
      note.y = -h - Math.random() * 20;
      note.stuck = false;
    }
    note.el.style.top = note.y + '%';
  });

  requestAnimationFrame(fall);
}

if (!noMotion) {
  requestAnimationFrame(fall);
}

// буквы chik падают
const chikCol = document.getElementById('chik-col');

const chikObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    chikCol.classList.add('falling');
    chikObserver.disconnect();
  }
}, { threshold: 0.3 });

chikObserver.observe(chikCol);

// правый блок: звезды за мышкой, крачки пугаются
const right3 = document.querySelector('.right-3');
const rightStars = right3.querySelectorAll('.sparkle');
const terns = right3.querySelectorAll('.tern');

right3.addEventListener('mousemove', function (e) {
  const rect = right3.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / rect.width * 2 - 1;
  const my = (e.clientY - rect.top) / rect.height * 2 - 1;

  // четные звезды бегут от мышки, нечетные к ней
  rightStars.forEach(function (star, k) {
    const power = (k + 2) * 0.8;
    let side = 1;
    if (k % 2 === 0) {
      side = -1;
    }
    star.style.translate = (mx * power * side) + 'vw ' + (my * power * side) + 'vw';
  });

  terns.forEach(function (tern) {
    const r = tern.getBoundingClientRect();
    let cx = r.left + r.width * 0.55;
    let cy = r.top + r.height * 0.71;
    if (tern.classList.contains('tern-top')) {
      cx = r.left + r.width * 0.45;
      cy = r.top + r.height * 0.34;
    }
    const dx = cx - e.clientX;
    const dy = cy - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const near = r.width * 0.45;

    tern.classList.toggle('lit', dist < r.width * 0.7);

    // чем ближе мышка, тем дальше отлетает
    if (dist < near) {
      const push = (near - dist) / near * 18;
      tern.style.translate = (dx / dist * push) + 'vw ' + (dy / dist * push) + 'vw';
    } else {
      tern.style.translate = '0 0';
    }
  });
});

right3.addEventListener('mouseleave', function () {
  rightStars.forEach(function (star) {
    star.style.translate = '0 0';
  });
  terns.forEach(function (tern) {
    tern.style.translate = '0 0';
    tern.classList.remove('lit');
  });
});

/* ПОДВАЛ */
// имя печатается
const footerName = document.getElementById('footer-name');
const nameText = footerName.textContent;

const footerObserver = new IntersectionObserver(function (entries) {
  if (!entries[0].isIntersecting) {
    return;
  }
  footerObserver.disconnect();
  if (noMotion) {
    return;
  }
  let k = 0;
  footerName.textContent = '';
  footerName.classList.add('typing');
  const timer = setInterval(function () {
    k++;
    footerName.textContent = nameText.slice(0, k);
    if (k >= nameText.length) {
      clearInterval(timer);
      setTimeout(function () {
        footerName.classList.remove('typing');
      }, 1200);
    }
  }, 70);
}, { threshold: 0.5 });

footerObserver.observe(document.querySelector('.footer'));

/* ВЕСЬ САЙТ */
// блоки выезжают когда до них долистали
const revealList = [
  ['.left-1', 'reveal-left'],
  ['.right-1', 'reveal-right'],
  ['.left-2', 'reveal-right'],
  ['.right-2', 'reveal-left'],
  ['.left-3', 'reveal-left'],
  ['.right-3', 'reveal-right'],
  ['.footer-student', 'reveal-up'],
  ['.footer-curators', 'reveal-up']
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

// нотки разлетаются при клике на птицу
const brandNotes = ['note-1', 'note-2', 'note-3', 'note-4', 'note-5', 'note-6', 'note-7'];

function dropNotes(x, y) {
  if (noMotion) {
    return;
  }
  for (let k = 0; k < 8; k++) {
    const n = document.createElement('img');
    n.src = '../chik/images/' + brandNotes[Math.floor(Math.random() * brandNotes.length)] + '.svg';
    n.className = 'fly-note';
    n.alt = '';
    n.style.left = x + 'px';
    n.style.top = y + 'px';
    n.style.width = (2 + Math.random() * 2) + 'vw';
    n.style.setProperty('--fx', (Math.random() * 16 - 8) + 'vw');
    n.style.setProperty('--fy', (Math.random() * -8) + 'vw');
    n.style.setProperty('--fr', (Math.random() * 360) + 'deg');
    n.style.animationDelay = (Math.random() * 0.15) + 's';
    n.addEventListener('animationend', function () {
      n.remove();
    });
    document.body.appendChild(n);
  }
}

['.left-2', '.parrot', '.right-3', '#flight'].forEach(function (sel) {
  document.querySelector(sel).addEventListener('click', function (e) {
    dropNotes(e.clientX, e.clientY);
  });
});

// глитч на фотках птиц
const glitchPhotos = document.querySelectorAll('.bird, .tern, .parrot');

function glitch() {
  const el = glitchPhotos[Math.floor(Math.random() * glitchPhotos.length)];
  el.animate([
    { filter: 'drop-shadow(0.8vw 0 0 #D9EE61) drop-shadow(-0.8vw 0 0 #6552D0)', offset: 0 },
    { filter: 'drop-shadow(-0.6vw 0.3vw 0 #D9EE61) drop-shadow(0.6vw -0.3vw 0 #6552D0)', offset: 0.33 },
    { filter: 'drop-shadow(1vw 0 0 #D9EE61) drop-shadow(-1vw 0 0 #6552D0)', offset: 0.66 },
    { filter: 'none', offset: 1 }
  ], { duration: 250, easing: 'steps(3)' });
  setTimeout(glitch, 1200 + Math.random() * 2000);
}

if (!noMotion) {
  setTimeout(glitch, 1500);
}

// след из ноток за курсором
if (!noMotion && window.matchMedia('(pointer: fine)').matches) {
  let trailX = 0;
  let trailY = 0;
  document.addEventListener('mousemove', function (e) {
    const dx = e.clientX - trailX;
    const dy = e.clientY - trailY;
    if (dx * dx + dy * dy < 1600) {
      return;
    }
    trailX = e.clientX;
    trailY = e.clientY;
    const t = document.createElement('img');
    t.src = '../chik/images/cursor-note.png';
    t.className = 'trail-note';
    t.alt = '';
    t.style.left = e.clientX + 'px';
    t.style.top = e.clientY + 'px';
    t.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
    t.addEventListener('animationend', function () {
      t.remove();
    });
    document.body.appendChild(t);
  });
}
