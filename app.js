// ==========================================================================
// SRS Corporation Premium Invoice Application Logic
// Real-Time Computation engine with Integrated Category Management
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // Data State Queue
  let invoiceItems = [
    {
      id: "item_1",
      range: "Wellness & Healthcare",
      name: "Premium Multivitamin Complex",
      qty: 2,
      price: 45.00,
      discount: 10
    },
    {
      id: "item_2",
      range: "Skincare",
      name: "Hydrating Hyaluronic Serum",
      qty: 1,
      price: 60.00,
      discount: 0
    }
  ];

  // DOM Interface Anchors
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

  // Payment System Node Selectors
  const controlPaymentMode = document.getElementById('control-payment-mode');
  const sheetPaymentModeDisplay = document.getElementById('sheet-payment-mode-display');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  // --- Real-Time Content Synthesizer Listeners ---
  inputInvId.addEventListener('input', (e) => sheetInvId.textContent = e.target.value || 'INV-XXXX');
  inputClientName.addEventListener('input', (e) => sheetClientName.textContent = e.target.value || 'Client Name');
  inputClientAddr.addEventListener('input', (e) => sheetClientAddr.textContent = e.target.value || 'Client Destination Address');

  // Action : Payment Mode selection linkage listener
  controlPaymentMode.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    
    // Convert storage names to human readable view variants cleanly
    let displayFormat = "2. UPI";
    if (selectedMode === "Net-Banking") displayFormat = "1. Net-Banking";
    if (selectedMode === "By-Cash") displayFormat = "3. By-Cash";
    
    sheetPaymentModeDisplay.textContent = displayFormat;
    spawnToast(`Payment method assigned: ${selectedMode}`, "info");
  });

  // --- Line Item Operations ---
  btnAddItem.addEventListener('click', () => {
    const range = inputItemRange.value;
    const name = inputItemName.value.trim();
    const qty = parseInt(inputItemQty.value) || 0;
    const price = parseFloat(inputItemPrice.value) || 0;
    const discount = parseInt(inputItemDiscount.value) || 0;

    if (!name) {
      spawnToast("Product name cannot remain empty.", "danger");
      return;
    }
    if (qty <= 0 || price < 0) {
      spawnToast("Verify valid mathematical constraints for price & units.", "danger");
      return;
    }

    const newItem = {
      id: 'item_' + Date.now(),
      range,
      name,
      qty,
      price,
      discount
    };

    invoiceItems.push(newItem);
    renderInterfaceMatrix();
    spawnToast(`Appended ${name} to calculation tables.`, "success");

    // Clear operational input lines
    inputItemName.value = '';
    inputItemQty.value = '1';
    inputItemPrice.value = '0.00';
    inputItemDiscount.value = '0';
  });

  window.deleteLineItem = (itemId) => {
    invoiceItems = invoiceItems.filter(item => item.id !== itemId);
    renderInterfaceMatrix();
    spawnToast("Item removed from matrix.", "danger");
  };

  // --- UI Computation Matrix Compiler ---
  function renderInterfaceMatrix() {
    // Clear structural tables buffers
    trackerTableBody.innerHTML = '';
    sheetTableBody.innerHTML = '';

    if (invoiceItems.length === 0) {
      tableEmptyState.style.display = 'flex';
      queueCountBadge.textContent = "0 Items";
      queueCountBadge.className = "badge";
    } else {
      tableEmptyState.style.display = 'none';
      queueCountBadge.textContent = `${invoiceItems.length} Products Added`;
      queueCountBadge.className = "badge badge-info";
    }

    let subtotalCumulative = 0;
    let totalDiscountCumulative = 0;

    invoiceItems.forEach(item => {
      const grossAmount = item.qty * item.price;
      const discountFraction = item.discount / 100;
      const deductionValue = grossAmount * discountFraction;
      const netAmount = grossAmount - deductionValue;

      subtotalCumulative += grossAmount;
      totalDiscountCumulative += deductionValue;

      // 1. Render Left Control Dashboard Row
      const dashboardRow = document.createElement('tr');
      dashboardRow.className = "item-row-animate";
      dashboardRow.innerHTML = `
        <td>
          <div class="item-title-desc">${item.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted)">Category: ${item.range}</div>
        </td>
        <td class="txt-center val-mono">${item.qty}</td>
        <td class="txt-right val-mono">$${item.price.toFixed(2)}</td>
        <td class="txt-right val-mono color-emerald-400">${item.discount}%</td>
        <td class="txt-right val-mono">$${netAmount.toFixed(2)}</td>
        <td class="txt-center">
          <button onclick="deleteLineItem('${item.id}')" class="btn-delete" title="Delete Line">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      trackerTableBody.appendChild(dashboardRow);

      // 2. Render Right Printable Invoice Sheet Matrix Row
      const sheetRow = document.createElement('tr');
      sheetRow.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #0f172a;">${item.name}</div>
          <div style="font-size: 0.7rem; color: var(--sheet-muted);">Range: ${item.range}</div>
        </td>
        <td class="txt-center val-mono">${item.qty}</td>
        <td class="txt-right val-mono">$${item.price.toFixed(2)}</td>
        <td class="txt-right val-mono">${item.discount > 0 ? '-' + item.discount + '%' : '0%'}</td>
        <td class="txt-right val-mono" style="font-weight:700; color: #0f172a;">$${netAmount.toFixed(2)}</td>
      `;
      sheetTableBody.appendChild(sheetRow);
    });

    const finalGrandTotal = subtotalCumulative - totalDiscountCumulative;

    // Flush computed metrics to visual document targets
    sheetSubtotal.textContent = `$${subtotalCumulative.toFixed(2)}`;
    sheetDiscount.textContent = `-$${totalDiscountCumulative.toFixed(2)}`;
    sheetGrandTotal.textContent = `$${finalGrandTotal.toFixed(2)}`;

    // Manage smart visibility parameters of calculation elements
    if (totalDiscountCumulative > 0) {
      sheetSavingsBox.style.visibility = "visible";
      sheetSavingsValue.textContent = `$${totalDiscountCumulative.toFixed(2)}`;
    } else {
      sheetSavingsBox.style.visibility = "hidden";
    }
  }

  // --- Utility Notification Engine ---
  function spawnToast(msg, variant = "info") {
    const frame = document.getElementById('toast-frame');
    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    
    let icon = "fa-info-circle";
    if (variant === "success") icon = "fa-circle-check";
    if (variant === "danger") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <div style="font-size:0.82rem; font-weight:600;">${msg}</div>
    `;
    
    frame.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Theme Toggle Controller ---
  btnThemeToggle.addEventListener('click', () => {
    const htmlNode = document.documentElement;
    const currentTheme = htmlNode.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlNode.setAttribute('data-theme', targetTheme);
    spawnToast(`Switched interface mode context to ${targetTheme}.`, "info");
  });

  // Initial Boot Sequence Configuration Execution
  renderInterfaceMatrix();
});
