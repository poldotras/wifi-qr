/* Tarjetas WiFi · Generador con QR — lógica de la aplicación */
(function () {
  'use strict';

  var form = document.getElementById('addForm');
  var ssidInput = document.getElementById('ssid');
  var encInput = document.getElementById('enc');
  var passInput = document.getElementById('pass');
  var hiddenInput = document.getElementById('hidden');
  var togglePw = document.getElementById('togglePw');
  var formError = document.getElementById('formError');
  var cardsEl = document.getElementById('cards');
  var emptyState = document.getElementById('emptyState');
  var counter = document.getElementById('counter');
  var count = 0;

  // Etiquetas legibles del cifrado
  var encLabel = { WPA: 'WPA / WPA2 / WPA3', WEP: 'WEP', nopass: 'Red abierta' };

  // Escapado según el formato WIFI: (\ ; , " :)
  function esc(s) {
    return s.replace(/([\\;,":])/g, '\\$1');
  }

  function buildWifiString(ssid, enc, pass, hidden) {
    var s = 'WIFI:T:' + enc + ';S:' + esc(ssid) + ';';
    if (enc !== 'nopass') s += 'P:' + esc(pass) + ';';
    if (hidden) s += 'H:true;';
    return s + ';';
  }

  /* ---------- Construcción de tarjetas ----------
     Se usa tanto para las tarjetas del usuario como para las de ejemplo
     de la landing (opts.demo = true → sin botones de acción). */
  function buildCard(ssid, enc, pass, hidden, opts) {
    opts = opts || {};

    var card = document.createElement('div');
    card.className = 'wifi-card';

    var meta = document.createElement('div');
    meta.className = 'meta';

    var eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = hidden ? 'Red WiFi · Oculta' : 'Red WiFi';

    var ssidEl = document.createElement('div');
    ssidEl.className = 'ssid';
    ssidEl.textContent = ssid;

    meta.appendChild(eyebrow);
    meta.appendChild(ssidEl);

    if (enc !== 'nopass') {
      var cred = document.createElement('div');
      cred.className = 'cred';
      var lbl = document.createElement('div');
      lbl.className = 'label';
      lbl.textContent = 'Contraseña';
      var val = document.createElement('div');
      val.className = 'value';
      val.textContent = pass;
      cred.appendChild(lbl);
      cred.appendChild(val);
      meta.appendChild(cred);
    }

    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = encLabel[enc];
    meta.appendChild(badge);

    var qrBox = document.createElement('div');
    qrBox.className = 'qr-box';
    var qrDiv = document.createElement('div');
    qrDiv.className = 'qr';
    qrBox.appendChild(qrDiv);
    var hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = 'Escanea para conectar';
    qrBox.appendChild(hint);

    card.appendChild(meta);
    card.appendChild(qrBox);

    if (!opts.demo) {
      var actions = document.createElement('div');
      actions.className = 'card-actions';
      var dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.textContent = 'PNG';
      dlBtn.title = 'Descargar esta tarjeta como imagen';
      dlBtn.addEventListener('click', function () { downloadCard(card, ssid); });
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'del';
      delBtn.textContent = 'Eliminar';
      delBtn.setAttribute('aria-label', 'Eliminar la tarjeta de la red ' + ssid);
      delBtn.addEventListener('click', function () {
        card.remove();
        count--;
        updateCounter();
        // No dejar el foco perdido en <body> tras eliminar la tarjeta
        counter.focus();
      });
      actions.appendChild(dlBtn);
      actions.appendChild(delBtn);
      card.appendChild(actions);
    }

    // Generar el código QR (todo ocurre en local)
    new QRCode(qrDiv, {
      text: buildWifiString(ssid, enc, pass, hidden),
      width: 140,
      height: 140,
      correctLevel: QRCode.CorrectLevel.M
    });

    // Accesibilidad: nombre para el QR y sin tooltip con la cadena WIFI:
    // (qrcodejs pone el payload completo, contraseña incluida, en title)
    qrDiv.removeAttribute('title');
    qrDiv.setAttribute('role', 'img');
    qrDiv.setAttribute('aria-label', 'Código QR para conectarse a la red ' + ssid);
    var qrImg = qrDiv.querySelector('img');
    if (qrImg) { qrImg.alt = ''; qrImg.setAttribute('aria-hidden', 'true'); }
    var qrCanvas = qrDiv.querySelector('canvas');
    if (qrCanvas) qrCanvas.setAttribute('aria-hidden', 'true');

    return card;
  }

  /* ---------- Formulario ---------- */

  // Deshabilitar contraseña si la red es abierta
  encInput.addEventListener('change', function () {
    var open = encInput.value === 'nopass';
    passInput.disabled = open;
    if (open) passInput.value = '';
  });

  // El campo se enmascara con la clase .masked (CSS text-security) en vez de
  // type=password, para que el navegador no ofrezca guardar la clave WiFi
  togglePw.addEventListener('click', function () {
    var show = passInput.classList.contains('masked');
    passInput.classList.toggle('masked', !show);
    togglePw.textContent = show ? 'ocultar' : 'ver';
    togglePw.setAttribute('aria-pressed', show ? 'true' : 'false');
  });

  function showError(msg) {
    formError.textContent = msg;
    formError.style.display = 'block';
  }
  function clearError() {
    formError.textContent = '';
    formError.style.display = 'none';
  }

  function updateCounter() {
    counter.textContent = count + (count === 1 ? ' red' : ' redes');
    emptyState.style.display = count === 0 ? '' : 'none';
  }

  function safeFileName(s) {
    return s.replace(/[^a-z0-9_\-]+/gi, '_').slice(0, 40) || 'wifi';
  }

  var downloading = false; // evita lotes de descarga solapados
  var dlStatus = document.getElementById('dlStatus');

  function setDlStatus(msg) {
    if (!dlStatus) return;
    dlStatus.textContent = msg || '';
    dlStatus.classList.toggle('on', !!msg);
  }

  async function downloadCard(cardEl, ssid) {
    var actions = cardEl.querySelector('.card-actions');
    if (actions) actions.style.visibility = 'hidden';
    try {
      var canvas = await html2canvas(cardEl, { scale: 3, backgroundColor: '#ffffff' });
      var a = document.createElement('a');
      a.download = 'wifi_' + safeFileName(ssid) + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      showError('No se pudo generar la imagen PNG. Prueba con la opción de imprimir.');
    } finally {
      if (actions) actions.style.visibility = '';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    // No recortar el SSID: hay redes reales con espacios al principio o al
    // final, y recortarlos generaría un QR que no conecta
    var ssid = ssidInput.value;
    var enc = encInput.value;
    var pass = passInput.value;
    var hidden = hiddenInput.checked;

    if (!ssid.trim()) { showError('El SSID no puede estar vacío.'); return; }
    if (enc !== 'nopass' && pass.length === 0) {
      showError('Introduce la contraseña o marca la red como abierta.');
      return;
    }
    if (enc === 'WPA') {
      if (pass.length === 64 && !/^[0-9a-fA-F]{64}$/.test(pass)) {
        showError('Una clave de 64 caracteres debe ser la PSK en hexadecimal (0-9, A-F).');
        return;
      }
      if (pass.length < 8) {
        showError('Las contraseñas WPA/WPA2/WPA3 tienen un mínimo de 8 caracteres.');
        return;
      }
    }

    var card = buildCard(ssid, enc, pass, hidden);
    cardsEl.appendChild(card);
    count++;
    updateCounter();

    // Reset parcial: mantener el cifrado seleccionado
    ssidInput.value = '';
    passInput.value = '';
    if (!passInput.classList.contains('masked')) {
      passInput.classList.add('masked');
      togglePw.textContent = 'ver';
      togglePw.setAttribute('aria-pressed', 'false');
    }
    hiddenInput.checked = false;
    ssidInput.focus();
  });

  document.getElementById('printBtn').addEventListener('click', function () {
    if (count === 0) { showError('Añade al menos una red antes de imprimir.'); return; }
    window.print();
  });

  document.getElementById('downloadAll').addEventListener('click', async function () {
    if (count === 0) { showError('Añade al menos una red antes de descargar.'); return; }
    if (downloading) return;
    downloading = true;
    var cards = cardsEl.querySelectorAll('.wifi-card');
    try {
      for (var i = 0; i < cards.length; i++) {
        // La NodeList es estática: saltar tarjetas eliminadas durante el lote
        if (!cards[i].isConnected) continue;
        setDlStatus('Descargando tarjeta ' + (i + 1) + ' de ' + cards.length +
          (cards.length > 1 ? '… Si el navegador lo pregunta, permite descargar varios archivos.' : '…'));
        var ssid = cards[i].querySelector('.ssid').textContent;
        await downloadCard(cards[i], ssid);
        // pequeña pausa para que el navegador procese cada descarga
        await new Promise(function (r) { setTimeout(r, 400); });
      }
    } finally {
      downloading = false;
      setDlStatus('');
    }
  });

  /* ---------- Tarjetas de ejemplo de la landing (redes ficticias) ---------- */
  var heroDemo = document.getElementById('heroDemo');
  if (heroDemo) {
    heroDemo.appendChild(buildCard('Casa_de_Marta', 'WPA', 'bienvenidos-2026', false, { demo: true }));
  }
  var resultDemo = document.getElementById('resultDemo');
  if (resultDemo) {
    resultDemo.appendChild(buildCard('Cafeteria Aurora', 'WPA', 'cortado-doble-24', false, { demo: true }));
  }

  /* ---------- Aviso legal ---------- */
  var legalDialog = document.getElementById('avisoLegal');
  var legalOpeners = document.querySelectorAll('[data-open-legal]');
  var legalClose = document.getElementById('closeLegal');
  if (legalDialog && legalClose) {
    for (var j = 0; j < legalOpeners.length; j++) {
      legalOpeners[j].addEventListener('click', function () {
        legalDialog.showModal();
      });
    }
    legalClose.addEventListener('click', function () { legalDialog.close(); });
    // Cerrar al pulsar sobre el fondo oscurecido
    legalDialog.addEventListener('click', function (e) {
      if (e.target === legalDialog) legalDialog.close();
    });
  }

  /* ---------- Año del pie ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  updateCounter();
})();
