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
