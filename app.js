/**
 * BarcodePrint - Aplicación Móvil para Generación e Impresión Térmica
 * Compatible con impresoras térmicas de etiquetas y recibos (Bluetooth, USB, Wi-Fi o Android Print)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos del DOM ---
  const productNameInput = document.getElementById('productName');
  const productCodeInput = document.getElementById('productCode');
  const productPriceInput = document.getElementById('productPrice');
  const productDetailInput = document.getElementById('productDetail');
  const barcodeFormatSelect = document.getElementById('barcodeFormat');
  const labelPresetSelect = document.getElementById('labelPreset');
  const printCopiesInput = document.getElementById('printCopies');
  const printCopiesLabel = document.getElementById('printCopiesLabel');
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const btnAutoCode = document.getElementById('btnAutoCode');
  const showBrandCheck = document.getElementById('showBrand');
  const showBrandLogoCheck = document.getElementById('showBrandLogo');
  const showPriceCheck = document.getElementById('showPrice');
  const showDetailCheck = document.getElementById('showDetail');

  // Preview Tab 1
  const labelPreviewCard = document.getElementById('labelPreviewCard');
  const prevBrand = document.getElementById('prevBrand');
  const prevBrandLogo = document.getElementById('prevBrandLogo');
  const prevTitle = document.getElementById('prevTitle');
  const prevDetail = document.getElementById('prevDetail');
  const prevCodeNumber = document.getElementById('prevCodeNumber');
  const prevPriceTag = document.getElementById('prevPriceTag');
  const barcodeSvg = document.getElementById('barcodeSvg');
  const previewDimsText = document.getElementById('previewDimsText');

  // Actions Tab 1
  const btnPrint = document.getElementById('btnPrint');
  const btnSaveProduct = document.getElementById('btnSaveProduct');
  const btnDownloadImg = document.getElementById('btnDownloadImg');
  const printArea = document.getElementById('printArea');
  const toast = document.getElementById('toast');

  // --- Elementos del DOM Tab 2 (Etiqueta de Precios Simple) ---
  const pricingProdName = document.getElementById('pricingProdName');
  const pricingMainPrice = document.getElementById('pricingMainPrice');
  const pricingShowUnit = document.getElementById('pricingShowUnit');
  const tierRows = Array.from(document.querySelectorAll('.tier-row'));

  const pricingLabelPreset = document.getElementById('pricingLabelPreset');
  const pricingCopies = document.getElementById('pricingCopies');
  const pricingCopiesLabel = document.getElementById('pricingCopiesLabel');
  const btnPricingQtyMinus = document.getElementById('btnPricingQtyMinus');
  const btnPricingQtyPlus = document.getElementById('btnPricingQtyPlus');
  const pricingShowLogo = document.getElementById('pricingShowLogo');

  // Preview Tab 2
  const pricingPreviewCard = document.getElementById('pricingPreviewCard');
  const sptProdName = document.getElementById('sptProdName');
  const sptLogoCircle = document.getElementById('sptLogoCircle');
  const sptMainNum = document.getElementById('sptMainNum');
  const sptTiers = document.getElementById('sptTiers');
  const sptUnit = document.getElementById('sptUnit');
  const pricingPreviewDims = document.getElementById('pricingPreviewDims');

  // Actions Tab 2
  const btnPricingPrint = document.getElementById('btnPricingPrint');
  const btnPricingSave = document.getElementById('btnPricingSave');
  const btnPricingDownloadImg = document.getElementById('btnPricingDownloadImg');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // History & Catalog
  const historyListContainer = document.getElementById('historyListContainer');
  const historyCount = document.getElementById('historyCount');
  const searchHistoryInput = document.getElementById('searchHistory');
  const btnExportCsv = document.getElementById('btnExportCsv');

  // Bluetooth Modal
  const btnBluetooth = document.getElementById('btnBluetooth');
  const btModal = document.getElementById('btModal');
  const btnCloseBtModal = document.getElementById('btnCloseBtModal');
  const btnScanBluetooth = document.getElementById('btnScanBluetooth');
  const btDeviceInfo = document.getElementById('btDeviceInfo');
  const btDeviceName = document.getElementById('btDeviceName');
  const btnDisconnectBt = document.getElementById('btnDisconnectBt');
  const btStatusDot = document.getElementById('btStatusDot');

  // Estado Bluetooth
  let bluetoothDevice = null;
  let bluetoothCharacteristic = null;

  // --- Base de Datos Local ---
  const STORAGE_KEY = 'barcode_print_catalog_v1';
  let catalog = loadCatalog();

  // --- Inicialización ---
  generateNewProductCode();
  updateLabelPreview();
  if (typeof updatePricingPreview === 'function') {
    updatePricingPreview();
  }
  renderCatalog();

  // ==========================================================
  // GENERADOR DE CÓDIGO NUMÉRICO
  // ==========================================================
  function generateNewProductCode() {
    const format = barcodeFormatSelect.value;
    let code = '';

    if (format === 'EAN13') {
      // Generar 12 dígitos y calcular el dígito de control EAN-13
      const base = '770' + Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 9);
      code = base + calculateEanChecksum(base);
    } else if (format === 'UPC') {
      // 11 dígitos + checksum
      const base = '7' + Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10);
      code = base + calculateEanChecksum(base);
    } else {
      // CODE128: 12 dígitos numéricos limpios y únicos
      const timePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(100000 + Math.random() * 900000).toString();
      code = timePart + randPart;
    }

    productCodeInput.value = code;
    updateLabelPreview();
  }

  function calculateEanChecksum(code) {
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const factor = (code.length - i) % 2 === 0 ? 3 : 1;
      sum += parseInt(code[i], 10) * factor;
    }
    return (10 - (sum % 10)) % 10;
  }

  // ==========================================================
  // ACTUALIZACIÓN DE VISTA PREVIA
  // ==========================================================
  function updateLabelPreview() {
    const name = productNameInput.value.trim() || 'Nombre del Producto';
    let code = productCodeInput.value.trim();
    const price = productPriceInput.value.trim();
    const detail = productDetailInput.value.trim();
    const format = barcodeFormatSelect.value;
    const preset = labelPresetSelect.value;

    // Si el campo de código está vacío, generamos uno
    if (!code) {
      code = '770123456789';
    }

    // Actualizar Textos
    if (showBrandCheck && showBrandCheck.checked) {
      prevBrand.style.display = 'flex';
      if (prevBrandLogo) {
        prevBrandLogo.style.display = (showBrandLogoCheck && showBrandLogoCheck.checked) ? 'inline-block' : 'none';
      }
    } else if (prevBrand) {
      prevBrand.style.display = 'none';
    }

    prevTitle.textContent = name;
    
    if (showDetailCheck.checked && detail) {
      prevDetail.style.display = 'block';
      prevDetail.textContent = detail;
    } else {
      prevDetail.style.display = 'none';
    }

    prevCodeNumber.textContent = code;

    if (showPriceCheck.checked && price) {
      prevPriceTag.style.display = 'inline-block';
      prevPriceTag.textContent = price.startsWith('$') ? price : `$${price}`;
    } else {
      prevPriceTag.style.display = 'none';
    }

    // Actualizar clases de dimensiones
    labelPreviewCard.className = `label-ticket-preview size-${preset}`;
    
    const presetLabels = {
      '40x30': '40 × 30 mm',
      '50x30': '50 × 30 mm',
      '50x25': '50 × 25 mm',
      '30x20': '30 × 20 mm',
      '58mm': '58 mm continuo',
      '80mm': '80 mm continuo'
    };
    previewDimsText.textContent = presetLabels[preset] || preset;

    // Renderizar Código de Barras con JsBarcode
    renderBarcode(barcodeSvg, code, format, preset);
  }

  function renderBarcode(svgElement, code, format, preset) {
    try {
      let barWidth = 1.6;
      let barHeight = 42;
      let fontSize = 12;

      if (preset === '30x20') {
        barWidth = 1.1;
        barHeight = 28;
        fontSize = 9;
      } else if (preset === '50x25') {
        barWidth = 1.4;
        barHeight = 32;
      } else if (preset === '80mm') {
        barWidth = 2.0;
        barHeight = 52;
      }

      // Validar según formato
      let renderFormat = format;
      if (format === 'EAN13' && code.length !== 12 && code.length !== 13) {
        renderFormat = 'CODE128'; // Fallback automático para no romper la visualización
      }

      JsBarcode(svgElement, code, {
        format: renderFormat,
        lineColor: "#000000",
        width: barWidth,
        height: barHeight,
        displayValue: false, // El número lo mostramos en el footer para mejor control
        margin: 0
      });
    } catch (e) {
      // Si falla un formato estricto, intentamos con CODE128
      try {
        JsBarcode(svgElement, code, {
          format: "CODE128",
          lineColor: "#000000",
          width: 1.4,
          height: 36,
          displayValue: false,
          margin: 0
        });
      } catch (err) {
        console.warn('Error renderizando código de barra:', err);
      }
    }
  }

  // ==========================================================
  // IMPRESIÓN FÍSICA PARA IMPRESORAS TÉRMICAS
  // ==========================================================
  btnPrint.addEventListener('click', () => {
    const copies = parseInt(printCopiesInput.value, 10) || 1;
    const name = productNameInput.value.trim() || 'Producto';
    const code = productCodeInput.value.trim() || '770123456789';
    const price = productPriceInput.value.trim();
    const detail = productDetailInput.value.trim();
    const format = barcodeFormatSelect.value;
    const preset = labelPresetSelect.value;

    // Si hay una impresora Bluetooth conectada directamente
    if (bluetoothCharacteristic) {
      printViaBluetooth(name, code, price, copies);
      return;
    }

    // Preparar el área de impresión con N copias
    printArea.innerHTML = '';

    for (let i = 0; i < copies; i++) {
      const item = document.createElement('div');
      item.className = `thermal-print-item preset-${preset}`;

      if (showBrandCheck && showBrandCheck.checked) {
        const brandElem = document.createElement('div');
        brandElem.className = 'th-brand';
        if (showBrandLogoCheck && showBrandLogoCheck.checked) {
          brandElem.innerHTML = '<img src="icons/logo.png" class="th-brand-logo" alt="Logo"><span>JR IMPORTADORA</span>';
        } else {
          brandElem.textContent = 'JR IMPORTADORA';
        }
        item.appendChild(brandElem);
      }

      const header = document.createElement('div');
      header.className = 'th-header';
      header.innerHTML = `
        <div class="th-name">${escapeHtml(name)}</div>
        ${showDetailCheck.checked && detail ? `<div class="th-detail">${escapeHtml(detail)}</div>` : ''}
      `;

      const barcodeBox = document.createElement('div');
      barcodeBox.className = 'th-barcode';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      barcodeBox.appendChild(svg);

      const footer = document.createElement('div');
      footer.className = 'th-footer';
      footer.innerHTML = `
        <span class="th-code">${escapeHtml(code)}</span>
        ${showPriceCheck.checked && price ? `<span class="th-price">${escapeHtml(price.startsWith('$') ? price : '$' + price)}</span>` : ''}
      `;

      item.appendChild(header);
      item.appendChild(barcodeBox);
      item.appendChild(footer);
      printArea.appendChild(item);

      // Renderizar el código en cada SVG clonado
      renderBarcode(svg, code, format, preset);
    }

    // Auto-guardar en catálogo
    saveCurrentProduct(false);

    // Enviar a la cola de impresión del sistema / móvil
    showToast(`Enviando ${copies} etiqueta(s) a la impresora...`);
    setTimeout(() => {
      window.print();
    }, 150);
  });

  // ==========================================================
  // CONTROL DE CANTIDAD (+ / -)
  // ==========================================================
  btnQtyMinus.addEventListener('click', () => {
    let val = parseInt(printCopiesInput.value, 10) || 1;
    if (val > 1) {
      val--;
      printCopiesInput.value = val;
      printCopiesLabel.textContent = val;
    }
  });

  btnQtyPlus.addEventListener('click', () => {
    let val = parseInt(printCopiesInput.value, 10) || 1;
    if (val < 500) {
      val++;
      printCopiesInput.value = val;
      printCopiesLabel.textContent = val;
    }
  });

  printCopiesInput.addEventListener('input', () => {
    let val = parseInt(printCopiesInput.value, 10) || 1;
    if (val < 1) val = 1;
    if (val > 500) val = 500;
    printCopiesLabel.textContent = val;
  });

  // ==========================================================
  // EVENTOS DE ENTRADA EN FORMULARIO
  // ==========================================================
  [productNameInput, productCodeInput, productPriceInput, productDetailInput].forEach(input => {
    input.addEventListener('input', updateLabelPreview);
  });

  [barcodeFormatSelect, labelPresetSelect, showBrandCheck, showPriceCheck, showDetailCheck].forEach(elem => {
    if (elem) elem.addEventListener('change', updateLabelPreview);
  });

  btnAutoCode.addEventListener('click', () => {
    generateNewProductCode();
    showToast('Nuevo código numérico generado');
  });

  // ==========================================================
  // DESCARGAR IMAGEN DE LA ETIQUETA (PNG)
  // ==========================================================
  btnDownloadImg.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones en alta resolución para nitidez
    canvas.width = 600;
    canvas.height = 400;

    // Fondo blanco térmico
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let startY = 50;
    if (showBrandCheck && showBrandCheck.checked) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JR IMPORTADORA', canvas.width / 2, 40);

      // Línea separadora
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(60, 48);
      ctx.lineTo(canvas.width - 60, 48);
      ctx.stroke();

      startY = 80;
    }

    // Texto de título
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(productNameInput.value.toUpperCase() || 'PRODUCTO', canvas.width / 2, startY);

    // Detalle
    if (showDetailCheck.checked && productDetailInput.value) {
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText(productDetailInput.value, canvas.width / 2, startY + 28);
    }

    // Convertir SVG de código de barras a imagen y dibujar en canvas
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Dibujar código de barra centrado
      const bWidth = 460;
      const bHeight = 160;
      ctx.drawImage(img, (canvas.width - bWidth) / 2, 110, bWidth, bHeight);

      // Footer: Código y Precio
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText(productCodeInput.value, 40, 340);

      if (showPriceCheck.checked && productPriceInput.value) {
        ctx.textAlign = 'right';
        ctx.font = 'bold 32px sans-serif';
        const p = productPriceInput.value.startsWith('$') ? productPriceInput.value : `$${productPriceInput.value}`;
        ctx.fillText(p, canvas.width - 40, 340);
      }

      // Descargar enlace
      const a = document.createElement('a');
      a.download = `etiqueta_${productCodeInput.value}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      URL.revokeObjectURL(blobURL);
      showToast('Imagen de etiqueta descargada');
    };
    img.src = blobURL;
  });

  // ==========================================================
  // TAB 2: GENERADOR DE ETIQUETA DE PRECIO SIMPLE (FIEL AL BOCETO)
  // ==========================================================

  // Inputs reactivos
  [pricingProdName, pricingMainPrice].forEach(input => {
    if (input) input.addEventListener('input', updatePricingPreview);
  });

  if (pricingLabelPreset) pricingLabelPreset.addEventListener('change', updatePricingPreview);
  if (pricingShowLogo) pricingShowLogo.addEventListener('change', updatePricingPreview);
  if (pricingShowUnit) pricingShowUnit.addEventListener('change', updatePricingPreview);

  tierRows.forEach(row => {
    row.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', updatePricingPreview);
      inp.addEventListener('change', updatePricingPreview);
    });
  });

  // Líneas de oferta: "Mas de 3 a $1.25", "Mas de 6 a ...", "Mas de 12 a ..."
  function readTierInputs() {
    return tierRows.map(row => ({
      on: row.querySelector('.tier-on').checked,
      prefix: row.querySelector('.tier-prefix').value.trim(),
      qty: row.querySelector('.tier-qty').value.trim(),
      conn: row.querySelector('.tier-conn').value.trim(),
      price: row.querySelector('.tier-price').value.replace('$', '').trim()
    }));
  }

  // Texto de la línea, ej: "Mas de 3 a $1.25"
  function tierText(t) {
    return [t.prefix, t.qty].filter(Boolean).join(' ');
  }

  // Solo las líneas activadas y completas
  function getTiers() {
    return readTierInputs()
      .filter(t => t.on && t.price)
      .map(t => ({ label: tierText(t), priceText: '$' + t.price + (t.conn ? ' ' + t.conn : '') }));
  }

  function tierHtml(t, p) {
    return '<span class="' + p + '-tier-label">' + escapeHtml(t.label) + '</span><span class="' + p + '-tier-price">' + escapeHtml(t.priceText) + '</span>';
  }

  // Stepper de copias para precios
  btnPricingQtyMinus.addEventListener('click', () => {
    let val = parseInt(pricingCopies.value, 10) || 1;
    if (val > 1) {
      val--;
      pricingCopies.value = val;
      pricingCopiesLabel.textContent = val;
    }
  });

  btnPricingQtyPlus.addEventListener('click', () => {
    let val = parseInt(pricingCopies.value, 10) || 1;
    if (val < 500) {
      val++;
      pricingCopies.value = val;
      pricingCopiesLabel.textContent = val;
    }
  });

  pricingCopies.addEventListener('input', () => {
    let val = parseInt(pricingCopies.value, 10) || 1;
    if (val < 1) val = 1;
    if (val > 500) val = 500;
    pricingCopiesLabel.textContent = val;
  });

  // Actualización en tiempo real de la etiqueta fiel al dibujo
  function updatePricingPreview() {
    const name = pricingProdName.value.trim() || 'Nombre del producto';
    const mainPrice = (pricingMainPrice.value || '1.50').replace('$', '').trim();
    const preset = pricingLabelPreset.value;

    // Dimensiones
    pricingPreviewCard.className = `simple-price-ticket size-${preset}`;
    
    const presetLabels = {
      '50x30': '50 × 30 mm',
      '40x30': '40 × 30 mm',
      '50x25': '50 × 25 mm',
      '60x40': '60 × 40 mm',
      '58mm': '58 mm continuo',
      '80mm': '80 mm continuo'
    };
    pricingPreviewDims.textContent = presetLabels[preset] || preset;

    // Contenido
    sptProdName.textContent = name;
    sptMainNum.textContent = mainPrice;
    // Líneas de oferta
    const tiers = getTiers();
    sptTiers.innerHTML = '';
    tiers.forEach(t => {
      const line = document.createElement('div');
      line.className = 'spt-tier';
      line.innerHTML = tierHtml(t, line.className.split('-')[0]);
      sptTiers.appendChild(line);
    });
    if (tiers.length) {
      pricingPreviewCard.classList.add('has-tiers', `has-tiers-${tiers.length}`);
    }
    tierRows.forEach(row => row.classList.toggle('off', !row.querySelector('.tier-on').checked));

    // Palabra UNIDAD
    sptUnit.style.display = pricingShowUnit.checked ? '' : 'none';

    // Círculo con logo
    sptLogoCircle.style.display = pricingShowLogo.checked ? 'flex' : 'none';
  }

  // Cargar producto del catálogo a la etiqueta simple de precio
  function loadProductIntoPricing(item) {
    pricingProdName.value = item.name || '';
    pricingMainPrice.value = (item.price || '1.50').replace('$', '');
    // Ofertas guardadas (compatible con productos viejos de 1 sola oferta)
    let saved = Array.isArray(item.tiers) ? item.tiers : null;
    if (!saved && item.offerPrice && item.offerEnabled !== false) {
      const m = String(item.offerCondition || '').match(/\d+/);
      saved = [{ on: true, prefix: 'Más de', conn: 'c/u', qty: m ? m[0] : 3, price: item.offerPrice.replace('$', '') }];
    }
    tierRows.forEach((row, i) => {
      const t = saved && saved[i];
      row.querySelector('.tier-on').checked = !!(t && t.on);
      if (t) {
        row.querySelector('.tier-prefix').value = t.prefix !== undefined ? t.prefix : 'Más de';
        row.querySelector('.tier-conn').value = (t.conn === undefined || t.conn === 'a') ? 'c/u' : t.conn;
        row.querySelector('.tier-qty').value = t.qty;
        row.querySelector('.tier-price').value = t.price;
      }
    });
    updatePricingPreview();
    showToast(`Cargado en Precios: ${item.name}`);
  }

  // Impresión Física Térmica (Fiel al boceto)
  btnPricingPrint.addEventListener('click', () => {
    const copies = parseInt(pricingCopies.value, 10) || 1;
    const name = pricingProdName.value.trim() || 'PRODUCTO';
    const mainPrice = (pricingMainPrice.value || '1.50').replace('$', '').trim();
    const tiers = getTiers();
    const preset = pricingLabelPreset.value;

    printArea.innerHTML = '';

    for (let i = 0; i < copies; i++) {
      const item = document.createElement('div');
      item.className = `thermal-price-item preset-${preset}` + (tiers.length ? ` has-tiers has-tiers-${tiers.length}` : '');

      // Fila Superior (Nombre a la izquierda, Círculo con logo a la derecha)
      const topRow = document.createElement('div');
      topRow.className = 'thp-top-row';

      const nameElem = document.createElement('div');
      nameElem.className = 'thp-prod-name';
      nameElem.textContent = name;
      topRow.appendChild(nameElem);

      if (pricingShowLogo.checked) {
        const logoCircle = document.createElement('div');
        logoCircle.className = 'thp-logo-circle';
        logoCircle.innerHTML = '<img src="icons/logo.png" alt="Logo">';
        topRow.appendChild(logoCircle);
      }
      item.appendChild(topRow);

      // Precio Principal Gigante + UNIDAD
      const mainPriceElem = document.createElement('div');
      mainPriceElem.className = 'thp-main-price';
      mainPriceElem.appendChild(document.createTextNode(`$${mainPrice}`));
      if (pricingShowUnit.checked) {
        const unit = document.createElement('span');
        unit.className = 'thp-unit';
        unit.textContent = 'UNIDAD';
        mainPriceElem.appendChild(unit);
      }
      item.appendChild(mainPriceElem);

      // Líneas de oferta (solo las activadas)
      if (tiers.length) {
        const box = document.createElement('div');
        box.className = 'thp-tiers';
        tiers.forEach(t => {
          const line = document.createElement('div');
          line.className = 'thp-tier';
          line.innerHTML = tierHtml(t, line.className.split('-')[0]);
          box.appendChild(line);
        });
        item.appendChild(box);
      }

      printArea.appendChild(item);
    }

    saveCurrentPricingProduct(false);

    showToast(`Enviando ${copies} etiqueta(s) a la impresora...`);
    setTimeout(() => {
      window.print();
    }, 150);
  });

  // Guardar en catálogo desde Tab de Precios
  function saveCurrentPricingProduct(showMessage = true) {
    const name = pricingProdName.value.trim();
    if (!name) return;

    const existingIndex = catalog.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    const itemData = {
      name,
      code: catalog[existingIndex] ? catalog[existingIndex].code : ('PR' + Date.now().toString().slice(-6)),
      price: pricingMainPrice.value.trim(),
      tiers: readTierInputs(),
      preset: pricingLabelPreset.value,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      catalog[existingIndex] = { ...catalog[existingIndex], ...itemData };
    } else {
      catalog.unshift(itemData);
    }

    saveCatalogToStorage();
    if (showMessage) {
      showToast('Guardado en el catálogo');
    }
  }

  btnPricingSave.addEventListener('click', () => {
    saveCurrentPricingProduct(true);
  });

  // Descargar imagen PNG nítida (Fiel al boceto del usuario)
  // Dibuja la etiqueta en un canvas y devuelve una promesa con el canvas listo
  function renderPricingCanvas(name, mainPrice, tiers, showLogo, showUnit) {
   return new Promise(resolve => {
    const NAVY = '#1a2140';
    const WINE = '#7b1c4b';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const W = 1024, H = 572;
    canvas.width = W;
    canvas.height = H;

    const pf = [300, 260, 260, 260][tiers.length];
    const tiersTop = H - 40 - tiers.length * 46;
    const FONT = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';

    // Fondo y borde
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, W - 14, H - 14);

    // Nombre arriba a la izquierda
    ctx.fillStyle = NAVY;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 64px ${FONT}`;
    ctx.fillText(name, 52, 130, showLogo ? 700 : 900);

    // Precio gigante centrado + UNIDAD
    const priceText = `$${mainPrice}`;
    ctx.font = `900 ${pf}px ${FONT}`;
    const priceW = ctx.measureText(priceText).width;
    ctx.font = `500 40px ${FONT}`;
    const unitW = showUnit ? ctx.measureText('UNIDAD').width + 16 : 0;
    const startX = (W - priceW - unitW) / 2;
    const priceBaseline = tiers.length ? 405 : 470;
    ctx.fillStyle = '#000000';
    ctx.font = `900 ${pf}px ${FONT}`;
    ctx.fillText(priceText, startX, priceBaseline);
    if (showUnit) {
      ctx.fillStyle = '#4b5675';
      ctx.font = `500 40px ${FONT}`;
      ctx.fillText('UNIDAD', startX + priceW + 16, priceBaseline - 12);
    }

    // Banner de ofertas en columnas
    if (tiers.length) {
      const bx = 26, by = 448, bw = W - 52, bh = 100, inner = 42;
      ctx.fillStyle = WINE;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = NAVY;
      ctx.fillRect(bx + inner, by, bw - inner * 2, bh);
      const cw = (bw - inner * 2) / tiers.length;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      tiers.forEach((t, i) => {
        const cx = bx + inner + cw * i + cw / 2;
        if (i > 0) {
          ctx.fillStyle = WINE;
          ctx.fillRect(bx + inner + cw * i - 2, by, 4, bh);
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = `500 ${tiers.length > 2 ? 34 : 40}px ${FONT}`;
        ctx.fillText(t.label, cx, by + 38, cw - 24);
        ctx.font = `800 ${tiers.length > 2 ? 46 : 54}px ${FONT}`;
        ctx.fillText(t.priceText, cx, by + 86, cw - 24);
      });
    }

    function finish() { resolve(canvas); }

    // Logo circular arriba a la derecha
    if (showLogo) {
      const cx = W - 125, cy = 118, r = 82;
      const logoImg = new Image();
      logoImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        finish();
      };
      logoImg.onerror = finish;
      logoImg.src = 'icons/logo.png';
    } else {
      finish();
    }
   });
  }

  btnPricingDownloadImg.addEventListener('click', async () => {
    const name = pricingProdName.value.trim() || 'Nombre del producto';
    const mainPrice = (pricingMainPrice.value || '1.50').replace('$', '').trim();
    const canvas = await renderPricingCanvas(name, mainPrice, getTiers(), pricingShowLogo.checked, pricingShowUnit.checked);
    const a = document.createElement('a');
    a.download = `precio_${name.toLowerCase().replace(/\s+/g, '_')}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Imagen de etiqueta descargada');
  });

  // ==========================================================
  // GESTIÓN DE CATÁLOGO / HISTORIAL (LocalStorage)
  // ==========================================================
  function loadCatalog() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCatalogToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    renderCatalog();
  }

  function saveCurrentProduct(showMessage = true) {
    const name = productNameInput.value.trim();
    const code = productCodeInput.value.trim();
    if (!name || !code) return;

    const existingIndex = catalog.findIndex(item => item.code === code);
    const itemData = {
      name,
      code,
      price: productPriceInput.value.trim(),
      detail: productDetailInput.value.trim(),
      format: barcodeFormatSelect.value,
      preset: labelPresetSelect.value,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      catalog[existingIndex] = itemData;
    } else {
      catalog.unshift(itemData);
    }

    saveCatalogToStorage();
    if (showMessage) {
      showToast('Guardado en el catálogo para tu sistema');
    }
  }

  btnSaveProduct.addEventListener('click', () => {
    saveCurrentProduct(true);
  });

  function renderCatalog(filterText = '') {
    historyCount.textContent = catalog.length;

    // Actualizar selector en pestaña de precios si existe
    const pricingCatalogSelect = document.getElementById('pricingCatalogSelect');
    if (pricingCatalogSelect) {
      const currentSelected = pricingCatalogSelect.value;
      pricingCatalogSelect.innerHTML = '<option value="">-- Seleccionar un producto guardado o escribir nuevo --</option>' + 
        catalog.map(item => `
          <option value="${escapeHtml(item.code)}" ${item.code === currentSelected ? 'selected' : ''}>
            ${escapeHtml(item.name)} (${item.price ? '$' + item.price.replace('$', '') : 'Sin precio'})
          </option>
        `).join('');
    }

    const term = filterText.toLowerCase();
    const filtered = catalog.filter(item => 
      item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      historyListContainer.innerHTML = `
        <div class="empty-history">
          ${catalog.length === 0 
            ? 'Aún no has guardado productos. Cuando crees una etiqueta podrás guardarla aquí.' 
            : 'No se encontraron productos con esa búsqueda.'}
        </div>
      `;
      return;
    }

    historyListContainer.innerHTML = filtered.map(item => `
      <div class="history-item">
        <div class="history-info">
          <span class="history-name">${escapeHtml(item.name)}</span>
          <div class="history-meta">
            <span class="history-code-badge">${escapeHtml(item.code)}</span>
            ${item.price ? `<span>${escapeHtml(item.price.startsWith('$') ? item.price : '$' + item.price)}</span>` : ''}
            ${item.detail ? `<span>• ${escapeHtml(item.detail)}</span>` : ''}
          </div>
        </div>
        <div class="history-actions">
          <button class="history-action-btn btn-load" data-code="${item.code}" title="Cargar en Código de Barras">
            🏷️
          </button>
          <button class="history-action-btn btn-load-pricing" data-code="${item.code}" title="Cargar en Etiqueta de Precios">
            💰
          </button>
          <button class="history-action-btn btn-copy" data-code="${item.code}" title="Copiar SKU para tu sistema">
            📋
          </button>
          <button class="history-action-btn btn-delete" data-code="${item.code}" title="Eliminar">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    // Eventos de los botones del catálogo
    historyListContainer.querySelectorAll('.btn-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = catalog.find(x => x.code === btn.dataset.code);
        if (item) {
          productNameInput.value = item.name;
          productCodeInput.value = item.code;
          productPriceInput.value = item.price || '';
          productDetailInput.value = item.detail || '';
          if (item.format) barcodeFormatSelect.value = item.format;
          if (item.preset) labelPresetSelect.value = item.preset;
          updateLabelPreview();
          switchTab('creator');
          showToast(`Cargado en Código de Barras: ${item.name}`);
        }
      });
    });

    historyListContainer.querySelectorAll('.btn-load-pricing').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = catalog.find(x => x.code === btn.dataset.code);
        if (item) {
          loadProductIntoPricing(item);
          switchTab('pricing');
        }
      });
    });

    historyListContainer.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.code).then(() => {
          showToast(`Número ${btn.dataset.code} copiado al portapapeles`);
        });
      });
    });

    historyListContainer.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        catalog = catalog.filter(x => x.code !== btn.dataset.code);
        saveCatalogToStorage();
        showToast('Producto eliminado');
      });
    });
  }

  searchHistoryInput.addEventListener('input', (e) => {
    renderCatalog(e.target.value);
  });

  // Exportar Catálogo a CSV para subir al sistema POS
  btnExportCsv.addEventListener('click', () => {
    if (catalog.length === 0) {
      showToast('No hay productos guardados para exportar');
      return;
    }

    let csv = 'Nombre,Codigo_Barras_SKU,Precio,Detalle_Talla,Formato,Fecha\n';
    catalog.forEach(item => {
      const line = [
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.code || '').replace(/"/g, '""')}"`,
        `"${(item.price || '').replace(/"/g, '""')}"`,
        `"${(item.detail || '').replace(/"/g, '""')}"`,
        `"${(item.format || '')}"`,
        `"${(item.updatedAt || '')}"`
      ].join(',');
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `catalogo_codigos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Catálogo CSV exportado con éxito');
  });

  // ==========================================================
  // CONMUTACIÓN DE PESTAÑAS (Móvil)
  // ==========================================================
  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // ==========================================================
  // BLUETOOTH DIRECTO (Impresoras Térmicas Portátiles)
  // ==========================================================
  btnBluetooth.addEventListener('click', () => {
    btModal.classList.add('active');
  });

  btnCloseBtModal.addEventListener('click', () => {
    btModal.classList.remove('active');
  });

  btnScanBluetooth.addEventListener('click', async () => {
    if (!navigator.bluetooth) {
      alert('Tu navegador no soporta Web Bluetooth directamente. Recuerda que puedes imprimir sin problemas usando el botón "Imprimir" normal a través del driver del celular (Android/iOS) o apps como RawBT.');
      return;
    }

    try {
      showToast('Buscando impresoras Bluetooth cercanas...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio estándar de impresoras térmicas ESC/POS
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Puerto serie SPP Bluetooth
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
        ]
      });

      const server = await device.gatt.connect();
      bluetoothDevice = device;

      // Buscar característica de escritura
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            bluetoothCharacteristic = char;
            break;
          }
        }
        if (bluetoothCharacteristic) break;
      }

      btStatusDot.classList.add('connected');
      btDeviceInfo.style.display = 'block';
      btDeviceName.textContent = `Conectado: ${device.name || 'Impresora Térmica'}`;
      showToast(`Conectado a ${device.name || 'Impresora'}`);
      btModal.classList.remove('active');

      device.addEventListener('gattserverdisconnected', () => {
        bluetoothDevice = null;
        bluetoothCharacteristic = null;
        btStatusDot.classList.remove('connected');
        btDeviceInfo.style.display = 'none';
        showToast('Impresora desconectada');
      });

    } catch (error) {
      console.warn('Bluetooth:', error);
      showToast('Búsqueda cancelada o no se seleccionó dispositivo');
    }
  });

  btnDisconnectBt.addEventListener('click', () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
  });

  // Envío ESC/POS directo por Bluetooth
  async function printViaBluetooth(name, code, price, copies) {
    if (!bluetoothCharacteristic) return;

    try {
      showToast(`Imprimiendo ${copies} etiqueta(s) vía Bluetooth...`);
      const encoder = new TextEncoder();

      for (let i = 0; i < copies; i++) {
        // Comandos ESC/POS básicos:
        // ESC @ (Reset) + ESC a 1 (Centrado)
        const init = new Uint8Array([0x1B, 0x40, 0x1B, 0x61, 0x01]);
        await bluetoothCharacteristic.writeValue(init);

        // Nombre
        const nameData = encoder.encode(`${name.toUpperCase()}\n`);
        await bluetoothCharacteristic.writeValue(nameData);

        // Código de barra ESC/POS (GS k formato Code128)
        // GS k 73 [longitud] [datos]
        const codeBytes = encoder.encode(code);
        const barcodeCmd = new Uint8Array([0x1D, 0x6B, 73, codeBytes.length, ...codeBytes]);
        await bluetoothCharacteristic.writeValue(barcodeCmd);

        // Número y precio
        const priceText = price ? `  ${price.startsWith('$') ? price : '$' + price}` : '';
        const footerData = encoder.encode(`\n${code}${priceText}\n\n\n`);
        await bluetoothCharacteristic.writeValue(footerData);

        // Corte de papel o avance de etiqueta (GS V 66 0)
        const cut = new Uint8Array([0x1D, 0x56, 0x42, 0x00]);
        await bluetoothCharacteristic.writeValue(cut);
      }
      showToast('Impresión Bluetooth completada');
    } catch (err) {
      console.error('Error enviando a Bluetooth:', err);
      showToast('Error al imprimir por Bluetooth, usando diálogo estándar');
      window.print();
    }
  }

  // ==========================================================
  // HELPERS
  // ==========================================================
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================
  // IMPORTAR EXCEL: lista de productos guardada en localStorage
  // ==========================================================
  const EXCEL_KEY = 'excel_products_v1';
  const excelFile = document.getElementById('excelFile');
  const excelMapping = document.getElementById('excelMapping');
  const excelSummary = document.getElementById('excelSummary');
  const excelSearch = document.getElementById('excelSearch');
  const excelResults = document.getElementById('excelResults');
  const excelOnlyWarn = document.getElementById('excelOnlyWarn');
  const excelNames = document.getElementById('excelNames');
  const excelCount = document.getElementById('excelCount');
  const mapIds = ['mapName', 'mapText', 'mapUnit', 'mapT0', 'mapT1', 'mapT2'];
  let excelProducts = [];
  let excelRows = [];
  let excelHeaders = [];

  try { excelProducts = JSON.parse(localStorage.getItem(EXCEL_KEY) || '[]'); } catch (e) { excelProducts = []; }

  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  function parseMoney(v) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') return isFinite(v) ? v.toFixed(2) : '';
    let s = String(v).replace(/[^\d.,]/g, '');
    if (!s) return '';
    if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
    else s = s.replace(',', '.');
    const n = parseFloat(s);
    return isFinite(n) ? n.toFixed(2) : '';
  }

  // Busca frases como "a partir de 3", "desde 6 unidades a $1.10", "3 o más"
  const PROMO_RE = /(a\s*partir\s*de|desde|m[aá]s\s*de|mayor(?:es)?\s*(?:a|de)|por\s*)\s*(\d+)\s*(?:unid(?:ades)?\.?|und?\.?|pzas?\.?|piezas?)?(?:\s*(?:en|a|=|:|-|por)?\s*\$\s*(\d+(?:[.,]\d+)?))?|(\d+)\s*(?:o|y)\s*m[aá]s(?:\s*(?:en|a|=|:|-)?\s*\$\s*(\d+(?:[.,]\d+)?))?|(?:caja|paquete|pack|docena)\s*(?:de)?\s*(\d+)\s*(?:unid(?:ades)?\.?|und?\.?|pzas?\.?|piezas?)?\s*(?:en|a|=|:|-|por)?\s*\$\s*(\d+(?:[.,]\d+)?)/gi;

  function findPromos(text) {
    const out = [];
    const t = String(text || '');
    let m;
    PROMO_RE.lastIndex = 0;
    while ((m = PROMO_RE.exec(t)) !== null) {
      if (m[6]) {
        const word = (m[0].match(/^[a-z]+/i) || ['Caja'])[0];
        out.push({ qty: parseInt(m[6], 10), price: parseMoney(m[7]), prefix: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + ' de', conn: '', box: true, text: m[0] });
        continue;
      }
      const isOrMore = !!m[4];
      out.push({
        qty: parseInt(isOrMore ? m[4] : m[2], 10),
        price: parseMoney(isOrMore ? m[5] : m[3]),
        prefix: isOrMore ? 'Desde' : (/m[aá]s/i.test(m[1]) ? 'Más de' : (/desde/i.test(m[1]) ? 'Desde' : 'A partir de')),
        conn: 'c/u',
        text: m[0]
      });
    }
    return out;
  }

  function cleanName(text) {
    let s = String(text || '');
    findPromos(s).forEach(p => { s = s.replace(p.text, ' '); });
    return s.replace(/\s+/g, ' ').replace(/[\s\-\/|,;:()]+$/g, '').replace(/^[\s\-\/|,;:]+/g, '').trim();
  }

  function detectHeaderRow(rows) {
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const filled = (rows[i] || []).filter(c => typeof c === 'string' && c.trim()).length;
      if (filled >= 2) return i;
    }
    return 0;
  }

  function fillSelect(id, headers, selected) {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="-1">(ninguna)</option>' +
      headers.map((h, i) => `<option value="${i}">${escapeHtml(h || ('Columna ' + (i + 1)))}</option>`).join('');
    sel.value = String(selected);
  }

  function autoDetect(headers) {
    const H = headers.map(norm);
    const find = (re, skip = []) => H.findIndex((h, i) => h && re.test(h) && !skip.includes(i));
    const name = find(/descrip|nombre|producto|articulo|item/);
    const priceLike = H.map((h, i) => (/precio|pvp|p\.?v\.?p|valor|costo|venta|unit|mayor|oferta|promo|docena|caja|paquete|x\s?\d|\d/.test(h) ? i : -1)).filter(i => i >= 0 && i !== name);
    // El precio de venta es la columna "Precio" (nunca "costo", "compra" ni "costo unitario")
    const isCost = h => /costo|compra|proveedor|cost/.test(h);
    let unit = H.findIndex((h, i) => i !== name && h && !isCost(h) && /^(precio|pvp|p\.?v\.?p|precio\s*(de\s*)?(venta|publico|unitario|normal|1))$/.test(h));
    if (unit < 0) unit = H.findIndex((h, i) => i !== name && h && !isCost(h) && /precio|pvp|p\.?v\.?p/.test(h));
    if (unit < 0) unit = priceLike.find(i => !isCost(H[i])) ?? -1;
    const tiers = priceLike.filter(i => i !== unit && !isCost(H[i]) && /mayor|oferta|promo|docena|caja|paquete|\d|x\s?\d|desde|partir/.test(H[i]));
    // Columna de ofertas: la que contiene frases tipo "a partir de 3 en $1,99"
    let text = -1, best = 0;
    headers.forEach((_, c) => {
      const hits = excelRows.slice(0, 200).filter(r => findPromos(r[c]).length).length;
      if (hits > best) { best = hits; text = c; }
    });
    let nm = name;
    if (text >= 0 && nm === text) {
      const other = H.findIndex((h, i) => h && i !== text && /nombre|producto|articulo|item|detalle/.test(h));
      if (other >= 0) nm = other;
    }
    if (text < 0) text = nm;
    return { name: nm, text, unit, t: [-1, -1, -1].map((v, i) => (text >= 0 && text !== nm ? v : (tiers[i] ?? -1))) };
  }

  function showMapping(auto) {
    excelMapping.style.display = '';
    fillSelect('mapName', excelHeaders, auto.name);
    fillSelect('mapText', excelHeaders, auto.text);
    fillSelect('mapUnit', excelHeaders, auto.unit);
    fillSelect('mapT0', excelHeaders, auto.t[0]);
    fillSelect('mapT1', excelHeaders, auto.t[1]);
    fillSelect('mapT2', excelHeaders, auto.t[2]);
  }

  excelFile.addEventListener('change', async () => {
    const file = excelFile.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') { showToast('No cargó la librería de Excel. Revisa tu internet y recarga.'); return; }
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
      const hi = detectHeaderRow(rows);
      excelHeaders = (rows[hi] || []).map(h => String(h).trim());
      excelRows = rows.slice(hi + 1).filter(r => r.some(c => String(c).trim() !== ''));
      showMapping(autoDetect(excelHeaders));
      processExcel();
    } catch (err) {
      console.error(err);
      showToast('No se pudo leer el archivo Excel');
    }
  });

  function processExcel() {
    const g = id => parseInt(document.getElementById(id).value, 10);
    const cName = g('mapName'), cText = g('mapText'), cUnit = g('mapUnit');
    const cT = [g('mapT0'), g('mapT1'), g('mapT2')];
    const defQ = document.getElementById('mapQtys').value.split(/[,\s]+/).map(x => parseInt(x, 10)).filter(Boolean);
    const defaults = [defQ[0] || 3, defQ[1] || 6, defQ[2] || 12];
    if (cName < 0) { showToast('Elige la columna de Descripción / Nombre'); return; }

    const seen = {};
    const products = [];
    excelRows.forEach((r, ri) => {
      const rawName = String(r[cName] ?? '').trim();
      if (!rawName) return;
      const text = cText >= 0 ? String(r[cText] ?? '') : rawName;
      const promos = findPromos(text).concat(cText !== cName ? findPromos(rawName) : []);
      const name = cleanName(rawName);
      const unit = cUnit >= 0 ? parseMoney(r[cUnit]) : '';
      const warns = [];
      const tiers = [];

      cT.forEach((col, i) => {
        const colPrice = col >= 0 ? parseMoney(r[col]) : '';
        const promo = promos[i];
        const price = colPrice || (promo && promo.price) || '';
        if (!price) {
          if (promo && col >= 0) warns.push(`Dice "${promo.text.trim()}" pero no hay precio en "${excelHeaders[col]}"`);
          return;
        }
        let qty = promo ? promo.qty : defaults[i];
        if (!promo) warns.push(`Tiene precio oferta ${i + 1} ($${price}) pero la descripción no dice desde cuántas unidades (se usó ${qty})`);
        if (promo && promo.price && colPrice && promo.price !== colPrice) {
          warns.push(`Precio no coincide: descripción dice $${promo.price}, columna dice $${colPrice} (se usó la columna)`);
        }
        tiers.push({ on: true, prefix: promo ? promo.prefix : 'A partir de', qty: String(qty), conn: promo ? promo.conn : 'c/u', price, box: !!(promo && promo.box) });
      });
      if (promos.length > tiers.length && !promos.slice(tiers.length).every(p => p.price)) {
        // ya avisado arriba por oferta sin precio
      }

      if (!unit) warns.push('Falta el precio de 1 unidad');
      tiers.filter(t => !t.box).forEach(t => {
        if (unit && parseFloat(t.price) >= parseFloat(unit)) warns.push(`Oferta "${t.prefix} ${t.qty}" ($${t.price}) no es menor que el precio unidad ($${unit})`);
      });
      const plain = tiers.filter(t => !t.box);
      for (let i = 1; i < plain.length; i++) {
        const tiers = plain;
        if (parseInt(tiers[i].qty, 10) <= parseInt(tiers[i - 1].qty, 10)) warns.push('Las cantidades de las ofertas no van de menor a mayor');
        if (parseFloat(tiers[i].price) > parseFloat(tiers[i - 1].price)) warns.push('Una oferta de más unidades es más cara que una de menos');
      }
      const key = norm(name);
      if (seen[key] !== undefined) warns.push(`Nombre repetido (fila ${seen[key] + 2})`); else seen[key] = ri;

      products.push({ name, price: unit, tiers, warnings: Array.from(new Set(warns)), row: ri + 2 });
    });

    excelProducts = products;
    localStorage.setItem(EXCEL_KEY, JSON.stringify(excelProducts));
    const bad = products.filter(p => p.warnings.length).length;
    excelSummary.style.display = '';
    excelSummary.innerHTML = `✅ <strong>${products.length}</strong> productos guardados. ` +
      (bad ? `⚠️ <strong>${bad}</strong> tienen alertas (actívalas abajo con "Mostrar solo productos con alertas").` : 'Sin alertas.');
    refreshExcelUi();
  }

  document.getElementById('btnExcelProcess').addEventListener('click', processExcel);

  document.getElementById('btnExcelClear').addEventListener('click', () => {
    if (!confirm('¿Borrar toda la lista importada?')) return;
    excelProducts = [];
    localStorage.removeItem(EXCEL_KEY);
    excelSummary.style.display = 'none';
    refreshExcelUi();
  });

  function tiersSummary(p) {
    return p.tiers.map(t => `${t.prefix} ${t.qty}: $${t.price}${t.box ? " (total)" : ""}`).join(' · ');
  }

  function renderExcelResults() {
    const q = norm(excelSearch.value);
    const words = q.split(/\s+/).filter(Boolean);
    const onlyWarn = excelOnlyWarn.checked;
    const list = excelProducts.filter(p => (!onlyWarn || p.warnings.length) && words.every(w => norm(p.name).includes(w)));
    if (!excelProducts.length) {
      excelResults.innerHTML = '<p class="help-text">Aún no has importado ningún Excel.</p>';
      return;
    }
    if (!list.length) { excelResults.innerHTML = '<p class="help-text">Sin resultados.</p>'; return; }
    excelResults.innerHTML = list.slice(0, 60).map(p => {
      const idx = excelProducts.indexOf(p);
      return `<div class="history-item" style="display:block;padding:10px 0;border-bottom:1px solid var(--input-border);">
        <strong>${escapeHtml(p.name)}</strong>
        <div class="help-text">1 unidad: ${p.price ? '$' + escapeHtml(p.price) : '—'}${p.tiers.length ? ' · ' + escapeHtml(tiersSummary(p)) : ''}</div>
        ${p.warnings.map(w => `<div style="color:var(--warning);font-size:12px;">⚠️ ${escapeHtml(w)} <em>(fila ${p.row})</em></div>`).join('')}
        <button type="button" class="btn btn-small btn-primary mt-1" data-excel-use="${idx}">Crear etiqueta</button>
      </div>`;
    }).join('') + (list.length > 60 ? `<p class="help-text">Mostrando 60 de ${list.length}. Escribe más letras para filtrar.</p>` : '');
  }

  function refreshExcelUi() {
    excelCount.textContent = excelProducts.length;
    excelNames.innerHTML = excelProducts.slice(0, 5000).map(p => `<option value="${escapeHtml(p.name)}"></option>`).join('');
    renderExcelResults();
  }

  function useExcelProduct(p) {
    loadProductIntoPricing({ name: p.name, price: p.price || '', tiers: p.tiers });
    switchTab('pricing');
    if (p.warnings.length) showToast('⚠️ Revisa: ' + p.warnings[0]);
  }

  excelResults.addEventListener('click', e => {
    const btn = e.target.closest('[data-excel-use]');
    if (btn) useExcelProduct(excelProducts[parseInt(btn.dataset.excelUse, 10)]);
  });
  excelSearch.addEventListener('input', renderExcelResults);
  excelOnlyWarn.addEventListener('change', renderExcelResults);

  // En la pestaña de precios: al elegir un nombre de la lista se cargan sus precios
  pricingProdName.addEventListener('input', () => {
    const v = norm(pricingProdName.value);
    if (!v) return;
    const p = excelProducts.find(x => norm(x.name) === v);
    if (p) {
      const typed = pricingProdName.value;
      loadProductIntoPricing({ name: p.name, price: p.price || '', tiers: p.tiers });
      if (p.warnings.length) showToast('⚠️ Revisa: ' + p.warnings[0]);
      if (pricingProdName.value !== typed) pricingProdName.value = typed;
    }
  });

  refreshExcelUi();
  // ---------- Generación masiva de imágenes (ZIP) ----------
  const btnBulkImages = document.getElementById('btnBulkImages');
  const bulkStatus = document.getElementById('bulkStatus');
  const bulkScope = document.getElementById('bulkScope');

  function fileSafe(s) {
    return norm(s).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'producto';
  }

  btnBulkImages.addEventListener('click', async () => {
    if (typeof JSZip === 'undefined') { showToast('No cargó la librería ZIP. Revisa tu internet y recarga.'); return; }
    const words = norm(excelSearch.value).split(/\s+/).filter(Boolean);
    let list = excelProducts;
    if (bulkScope.value === 'filtered') {
      list = excelProducts.filter(p => (!excelOnlyWarn.checked || p.warnings.length) && words.every(w => norm(p.name).includes(w)));
    }
    list = list.filter(p => p.price || p.tiers.length);
    if (!list.length) { showToast('No hay productos para generar'); return; }
    if (list.length > 300 && !confirm(`Vas a generar ${list.length} imágenes. Puede tardar. ¿Continuar?`)) return;

    btnBulkImages.disabled = true;
    const zip = new JSZip();
    const used = {};
    let showLogo = pricingShowLogo.checked, logoBlocked = false;
    const showUnit = pricingShowUnit.checked;
    try {
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        const tiers = p.tiers.slice(0, 3).map(t => ({
          label: [t.prefix, t.qty].filter(Boolean).join(' '),
          priceText: '$' + t.price + (t.conn ? ' ' + t.conn : '')
        }));
        const toPng = async (withLogo) => {
          const canvas = await renderPricingCanvas(p.name, p.price || '0.00', tiers, withLogo, showUnit);
          return await new Promise((res, rej) => {
            try { canvas.toBlob(b => (b ? res(b) : rej(new Error('canvas vacío'))), 'image/png'); } catch (e) { rej(e); }
          });
        };
        let blob;
        try { blob = await toPng(showLogo); }
        catch (e) {
          // Si el navegador bloquea el logo (abrir como archivo local), se genera sin logo
          if (!showLogo) throw e;
          logoBlocked = true;
          showLogo = false;
          blob = await toPng(false);
        }
        let base = fileSafe(p.name);
        used[base] = (used[base] || 0) + 1;
        if (used[base] > 1) base += '_' + used[base];
        zip.file(base + '.png', blob);
        bulkStatus.textContent = `Generando ${i + 1} de ${list.length}...`;
        if (i % 5 === 4) await new Promise(r => setTimeout(r, 0));
      }
      bulkStatus.textContent = 'Comprimiendo ZIP...';
      const out = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(out);
      a.download = 'etiquetas_precios.zip';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      bulkStatus.textContent = (logoBlocked ? '⚠️ El navegador bloqueó el logo (abre la app desde http://localhost o Vercel). ' : '') + `✅ ${list.length} imágenes en etiquetas_precios.zip`;
    } catch (err) {
      console.error(err);
      bulkStatus.textContent = 'Error al generar las imágenes: ' + (err && err.message ? err.message : err);
    }
    btnBulkImages.disabled = false;
  });

  // Manejo de Service Worker para PWA
  if ('serviceWorker' in navigator) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      // En desarrollo local (Live Server), desregistrar SWs viejos y purgar caché para que siempre refresque en vivo
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then(names => {
          for (const name of names) caches.delete(name);
        });
      }
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration failed:', err);
        });
      });
    }
  }
});

