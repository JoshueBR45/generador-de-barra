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
  const showPriceCheck = document.getElementById('showPrice');
  const showDetailCheck = document.getElementById('showDetail');

  // Preview
  const labelPreviewCard = document.getElementById('labelPreviewCard');
  const prevTitle = document.getElementById('prevTitle');
  const prevDetail = document.getElementById('prevDetail');
  const prevCodeNumber = document.getElementById('prevCodeNumber');
  const prevPriceTag = document.getElementById('prevPriceTag');
  const barcodeSvg = document.getElementById('barcodeSvg');
  const previewDimsText = document.getElementById('previewDimsText');

  // Actions
  const btnPrint = document.getElementById('btnPrint');
  const btnSaveProduct = document.getElementById('btnSaveProduct');
  const btnDownloadImg = document.getElementById('btnDownloadImg');
  const printArea = document.getElementById('printArea');
  const toast = document.getElementById('toast');

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

  [barcodeFormatSelect, labelPresetSelect, showPriceCheck, showDetailCheck].forEach(elem => {
    elem.addEventListener('change', updateLabelPreview);
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

    // Texto de título
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(productNameInput.value.toUpperCase() || 'PRODUCTO', canvas.width / 2, 50);

    // Detalle
    if (showDetailCheck.checked && productDetailInput.value) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText(productDetailInput.value, canvas.width / 2, 85);
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
          <button class="history-action-btn btn-load" data-code="${item.code}" title="Cargar y editar">
            ✏️
          </button>
          <button class="history-action-btn btn-copy" data-code="${item.code}" title="Copiar número para tu sistema">
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
          showToast(`Cargado: ${item.name}`);
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

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    });
  }
});

