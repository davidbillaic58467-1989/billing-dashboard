// ==========================================================================
// S Vairasamy Billing Control Engine
// Computation logic structured for Indian Rupee (₹) and Category Tracking
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // Initial Seed State Configuration (Indian Rupee Currency Context)
  let invoiceItems = [
    {
      id: "seed_1",
      range: "Wellness & Healthcare",
      name: "Ashwagandha Premium Capsules",
      qty: 5,
      price: 340.00,
      discount: 10
    },
    {
      id: "seed_2",
      range: "Oralcare",
      name: "Ayurvedic Clove Gel Toothpaste",
      qty: 10,
      price: 95.00,
      discount: 5
    }
  ];

  // Interface Input Component Anchors
  const inputInvId = document.getElementById('input-inv-id');
  const inputClientName = document.getElementById('input-client-name');
  const inputClientAddr = document.getElementById('input-client-addr');

  const sheetInvId = document.getElementById('sheet-inv-id');
  const sheetClientName = document.getElementById('sheet-client-name');
  const sheetClientAddr = document.getElementById('sheet-client-addr');

  const inputItemRange = document.getElementById('input-item-range');
  const inputItemName = document.getElementById('input-item-name');
  const inputItemQty = document.getElementById('input-item-qty');
  const inputItemPrice = document.getElementById('input-item-price');
  const inputItemDiscount = document.getElementById('input-item-discount');
  const btnAddItem = document.getElementById('btn-add-item');

  const trackerTableBody = document.getElementById('tracker-table-body');
  const sheetTableBody = document.getElementById('sheet-table-body');
  const tableEmptyState = document.getElementById('table-empty-state');
  const queueCountBadge = document.getElementById('queue-count-badge');

  const sheetSubtotal = document.getElementById('sheet-subtotal');
  const sheetDiscount = document.getElementById('sheet-discount');
  const sheetGrandTotal = document.getElementById('sheet-grand-total');
  const sheetSavingsBox = document.getElementById('sheet-savings-box');
  const sheetSavingsValue = document.getElementById('sheet-savings-value');

  const controlPaymentMode = document.getElementById('control-payment-mode');
  const sheetPaymentModeDisplay = document.getElementById('sheet-payment-mode-display');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  // --- Live Synchronization Event Framework ---
  inputInvId.addEventListener('input', (e) => sheetInvId.textContent = e.target.value || 'INV-XXXX');
  inputClientName.addEventListener('input', (e) => sheetClientName.textContent = e.target.value || 'Buyer Identity');
  inputClientAddr.addEventListener('input', (e) => sheetClientAddr.textContent = e.target.value || 'Delivery Destination Location Address');

  // Action Logic: Routing Payment Mode Selections Cleanly
  controlPaymentMode.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    let formattedLabel = "2. UPI";

    if (selectedMode === "Net-Banking") formattedLabel = "1. Net-Banking";
    if (selectedMode === "By-Cash") formattedLabel = "3. By-Cash";

    sheetPaymentModeDisplay.textContent = formattedLabel;
    spawnToastNotification(`Payment setup set to: ${selectedMode}`, "success");
  });

  // --- Dynamic Table Line Append Methods ---
  btnAddItem.addEventListener('click', () => {
    const range = inputItemRange.value;
    const name = inputItemName.value.trim();
    const qty = parseInt(inputItemQty.value) || 0;
    const price = parseFloat(inputItemPrice.value) || 0;
    const discount = parseInt(inputItemDiscount.value) || 0;

    if (!name) {
      spawnToastNotification("Please supply an accurate product title name.", "danger");
      return;
    }
    if (qty <= 0 || price < 0) {
      spawnToastNotification("Invalid quantity or pricing value fields specified.", "danger");
      return;
    }

    const entryObject = {
      id: 'prod_' + Date.now(),
      range,
      name,
      qty,
      price,
      discount
    };

    invoiceItems.push(entryObject);
    compileMatrixCalculations();
    spawnToastNotification(`Added "${name}" into system matrices.`, "success");

    // Reset localized product elements fields safely
    inputItemName.value = '';
    inputItemQty.value = '1';
    inputItemPrice.value = '0.00';
    inputItemDiscount.value = '0';
  });

  window.deleteLineItem = (targetId) => {
    invoiceItems = invoiceItems.filter(item => item.id !== targetId);
    compileMatrixCalculations();
    spawnToastNotification("Product item detached from document computations.", "danger");
  };

  // --- Core Calculation Matrix Compiler (Indian Rupee Symbol Integrated) ---
  function compileMatrixCalculations() {
    trackerTableBody.innerHTML = '';
    sheetTableBody.innerHTML = '';

    if (invoiceItems.length === 0) {
      tableEmptyState.style.display = 'flex';
      queueCountBadge.textContent = "0 Items Selected";
      queueCountBadge.className = "badge";
    } else {
      tableEmptyState.style.display = 'none';
      queueCountBadge.textContent = `${invoiceItems.length} Products Active`;
      queueCountBadge.className = "badge badge-info";
    }

    let subtotalAccumulator = 0;
    let discountAccumulator = 0;

    invoiceItems.forEach(item => {
      const lineGrossAmount = item.qty * item.price;
      const calculatedDeduction = lineGrossAmount * (item.discount / 100);
      const netFinalLineValue = lineGrossAmount - calculatedDeduction;

      subtotalAccumulator += lineGrossAmount;
      discountAccumulator += calculatedDeduction;

      // Create interactive tracker row entries
      const controlRowNode = document.createElement('tr');
      controlRowNode.className = "item-row-animate";
      controlRowNode.innerHTML = `
        <td>
          <div class="item-title-desc">${item.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted)">Sector: ${item.range}</div>
        </td>
        <td class="txt-center val-mono">${item.qty}</td>
        <td class="txt-right val-mono">₹${item.price.toFixed(2)}</td>
        <td class="txt-right val-mono" style="color: var(--emerald-500);">${item.discount}%</td>
        <td class="txt-right val-mono">₹${netFinalLineValue.toFixed(2)}</td>
        <td class="txt-center">
          <button onclick="deleteLineItem('${item.id}')" class="btn-delete" title="Remove Entry">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      trackerTableBody.appendChild(controlRowNode);

      // Create matching immutable printable sheet table row lines
      const documentSheetRow = document.createElement('tr');
      documentSheetRow.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #0f172a;">${item.name}</div>
          <div style="font-size: 0.72rem; color: var(--sheet-muted);">Range: ${item.range}</div>
        </td>
        <td class="txt-center val-mono">${item.qty}</td>
        <td class="txt-right val-mono">₹${item.price.toFixed(2)}</td>
        <td class="txt-right val-mono">${item.discount > 0 ? '-' + item.discount + '%' : '0%'}</td>
        <td class="txt-right val-mono" style="font-weight: 800; color: #0f172a;">₹${netFinalLineValue.toFixed(2)}</td>
      `;
      sheetTableBody.appendChild(documentSheetRow);
    });

    const netInvoicePayableSum = subtotalAccumulator - discountAccumulator;

    // Flush currency calculations through to matching labels
    sheetSubtotal.textContent = `₹${subtotalAccumulator.toFixed(2)}`;
    sheetDiscount.textContent = `-₹${discountAccumulator.toFixed(2)}`;
    sheetGrandTotal.textContent = `₹${netInvoicePayableSum.toFixed(2)}`;

    // Manage smart dynamic savings alert view states
    if (discountAccumulator > 0) {
      sheetSavingsBox.style.visibility = "visible";
      sheetSavingsValue.textContent = `₹${discountAccumulator.toFixed(2)}`;
    } else {
      sheetSavingsBox.style.visibility = "hidden";
    }
  }

  // --- Dynamic Application Alerts System ---
  function spawnToastNotification(msg, variant = "info") {
    const frame = document.getElementById('toast-frame');
    const element = document.createElement('div');
    element.className = `toast toast-${variant}`;
    
    let graphic = "fa-info-circle";
    if (variant === "success") graphic = "fa-circle-check";
    if (variant === "danger") graphic = "fa-triangle-exclamation";

    element.innerHTML = `
      <i class="fa-solid ${graphic}"></i>
      <div style="font-size: 0.84rem; font-weight: 600;">${msg}</div>
    `;
    
    frame.appendChild(element);
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(8px)';
      setTimeout(() => element.remove(), 300);
    }, 3200);
  }

  // --- Dark/Light Mode Theme Toggle Control Switch ---
  btnThemeToggle.addEventListener('click', () => {
    const rootNode = document.documentElement;
    const activeState = rootNode.getAttribute('data-theme');
    const invertedState = activeState === 'dark' ? 'light' : 'dark';
    
    rootNode.setAttribute('data-theme', invertedState);
    spawnToastNotification(`Display mode converted to ${invertedState} context view.`, "info");
  });

  // Execute initial runtime compilation setup
  compileMatrixCalculations();
});
