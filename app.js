// Local In-Memory Matrix Array State
let invoiceItems = [];

// DOM Infrastructure Selectors
const elements = {
    themeToggle: document.getElementById('btn-theme-toggle'),
    invIdInput: document.getElementById('input-inv-id'),
    clientNameInput: document.getElementById('input-client-name'),
    clientAddrInput: document.getElementById('input-client-addr'),
    
    // Add Item Parameters
    itemRange: document.getElementById('input-item-range'),
    itemName: document.getElementById('input-item-name'),
    itemQty: document.getElementById('input-item-qty'),
    itemMrp: document.getElementById('input-item-mrp'),
    itemDap: document.getElementById('input-item-dap'),
    itemDiscount: document.getElementById('input-item-discount'),
    btnAddItem: document.getElementById('btn-add-item'),
    
    // Live View Pilled Preview Counters
    previewEffPrice: document.getElementById('preview-eff-price'),
    previewItemTotal: document.getElementById('preview-item-total'),
    
    // Lists Tables Pipelines
    queueCountBadge: document.getElementById('queue-count-badge'),
    trackerTableBody: document.getElementById('tracker-table-body'),
    tableEmptyState: document.getElementById('table-empty-state'),
    
    // Mirror Sheet Displays
    sheetInvId: document.getElementById('sheet-inv-id'),
    sheetClientName: document.getElementById('sheet-client-name'),
    sheetClientAddr: document.getElementById('sheet-client-addr'),
    sheetTableBody: document.getElementById('sheet-table-body'),
    sheetSavingsBox: document.getElementById('sheet-savings-box'),
    sheetSavingsValue: document.getElementById('sheet-savings-value'),
    sheetSubtotal: document.getElementById('sheet-subtotal'),
    sheetDiscount: document.getElementById('sheet-discount'),
    sheetGrandTotal: document.getElementById('sheet-grand-total'),
    controlPaymentMode: document.getElementById('control-payment-mode'),
    sheetPaymentModeDisplay: document.getElementById('sheet-payment-mode-display'),
    toastFrame: document.getElementById('toast-frame')
};

// Application Init Setup 
document.addEventListener('DOMContentLoaded', () => {
    registerLiveSynchronization();
    calculateLiveInputPills();
});

// Setup Configuration Listeners for Instant A4 Copy Mirroring
function registerLiveSynchronization() {
    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
    });

    elements.invIdInput.addEventListener('input', (e) => elements.sheetInvId.textContent = e.target.value);
    elements.clientNameInput.addEventListener('input', (e) => elements.sheetClientName.textContent = e.target.value);
    elements.clientAddrInput.addEventListener('input', (e) => elements.sheetClientAddr.textContent = e.target.value);
    
    // Interactive changes mapping for dynamic calculation matrix preview row
    [elements.itemQty, elements.itemMrp, elements.itemDap, elements.itemDiscount].forEach(input => {
        input.addEventListener('input', calculateLiveInputPills);
    });

    elements.controlPaymentMode.addEventListener('change', (e) => {
        elements.sheetPaymentModeDisplay.textContent = e.target.value;
    });

    elements.btnAddItem.addEventListener('click', parseAndAddLineItem);
}

// Live calculation mechanics logic inside input controller
function calculateLiveInputPills() {
    const mrp = parseFloat(elements.itemMrp.value) || 0;
    const dap = parseFloat(elements.itemDap.value) || 0;
    const qty = parseInt(elements.itemQty.value) || 1;
    const discPercent = parseFloat(elements.itemDiscount.value) || 0;

    // Base target value for discount computations defaults to DAP value
    const baseTarget = dap > 0 ? dap : mrp;
    const computedEffectiveUnit = baseTarget - (baseTarget * (discPercent / 100));
    const computedGrossTotal = computedEffectiveUnit * qty;

    elements.previewEffPrice.textContent = `₹${computedEffectiveUnit.toFixed(2)}`;
    elements.previewItemTotal.textContent = `₹${computedGrossTotal.toFixed(2)}`;
}

// Validation, Capture state generation lifecycle
function parseAndAddLineItem() {
    const range = elements.itemRange.value;
    const name = elements.itemName.value.trim();
    const qty = parseInt(elements.itemQty.value) || 0;
    const mrp = parseFloat(elements.itemMrp.value) || 0;
    const dap = parseFloat(elements.itemDap.value) || 0;
    const discount = parseFloat(elements.itemDiscount.value) || 0;

    if (!name) {
        triggerToast("⚠️ Product Specific Title missing!");
        return;
    }
    if (qty <= 0) {
        triggerToast("⚠️ Quantity metric must be at least 1.");
        return;
    }
    if (mrp <= 0 && dap <= 0) {
        triggerToast("⚠️ Provide either a valid MRP or DAP value.");
        return;
    }

    // Mathematical Object Definition
    const baseRate = dap > 0 ? dap : mrp;
    const discountedRate = baseRate - (baseRate * (discount / 100));
    const finalRowAmount = discountedRate * qty;
    
    // Dynamic absolute margin calculations savings per row item
    const grossMrpValueTotal = mrp * qty;
    const absoluteSavingsEarned = grossMrpValueTotal - finalRowAmount;

    const lineItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        range,
        name,
        qty,
        mrp,
        dap,
        discount,
        finalRowAmount,
        grossMrpValueTotal,
        absoluteSavingsEarned
    };

    invoiceItems.push(lineItem);
    triggerToast(`✨ Added: ${name}`);
    clearInputBlockFields();
    renderDataMatrixPipelines();
}

// Reset context parameters excluding selections
function clearInputBlockFields() {
    elements.itemName.value = '';
    elements.itemQty.value = '1';
    elements.itemMrp.value = '0.00';
    elements.itemDap.value = '0.00';
    elements.itemDiscount.value = '0';
    calculateLiveInputPills();
}

// Master rendering core engine
function renderDataMatrixPipelines() {
    // Sync table state arrays length configuration parameters
    elements.queueCountBadge.textContent = `${invoiceItems.length} Item${invoiceItems.length === 1 ? '' : 's'}`;
    
    if(invoiceItems.length === 0) {
        elements.tableEmptyState.style.display = "flex";
        elements.trackerTableBody.innerHTML = "";
        elements.sheetTableBody.innerHTML = "";
        elements.sheetSubtotal.textContent = "₹0.00";
        elements.sheetDiscount.textContent = "-₹0.00";
        elements.sheetGrandTotal.textContent = "₹0.00";
        elements.sheetSavingsBox.style.visibility = "hidden";
        return;
    }
    
    elements.tableEmptyState.style.display = "none";
    
    let htmlQueue = "";
    let htmlSheet = "";
    
    let totalGrossMRPValue = 0;
    let totalAbsoluteSavingsValue = 0;
    let grandNetPayableTotal = 0;

    invoiceItems.forEach((item) => {
        totalGrossMRPValue += item.grossMrpValueTotal;
        totalAbsoluteSavingsValue += item.absoluteSavingsEarned;
        grandNetPayableTotal += item.finalRowAmount;

        // Populate Table Display
        htmlQueue += `
            <tr>
                <td>
                    <strong>${item.name}</strong><br>
                    <small style="color: var(--text-muted); font-size:0.75rem;">${item.range}</small>
                </td>
                <td class="txt-right var-mono">₹${item.mrp.toFixed(2)}</td>
                <td class="txt-right var-mono">₹${item.dap.toFixed(2)}</td>
                <td class="txt-center">${item.qty}</td>
                <td class="txt-right text-danger">${item.discount}%</td>
                <td class="txt-right var-mono" style="font-weight:700;">₹${item.finalRowAmount.toFixed(2)}</td>
                <td class="txt-center">
                    <button onclick="removeLineItem('${item.id}')" class="btn-danger-icon" title="Delete Row">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;

        // Populate dynamic real-time A4 printable rendering sheet 
        htmlSheet += `
            <tr>
                <td>
                    <div style="font-weight: 700; color: #0f172a;">${item.name}</div>
                    <div class="inv-item-range-lbl">${item.range}</div>
                </td>
                <td class="txt-right">₹${item.mrp.toFixed(2)}</td>
                <td class="txt-right">₹${item.dap.toFixed(2)}</td>
                <td class="txt-center">${item.qty}</td>
                <td class="txt-right" style="color: #b91c1c;">${item.discount}%</td>
                <td class="txt-right" style="font-weight: 700; color: #0f172a;">₹${item.finalRowAmount.toFixed(2)}</td>
            </tr>
        `;
    });

    elements.trackerTableBody.innerHTML = htmlQueue;
    elements.sheetTableBody.innerHTML = htmlSheet;

    // Apply calculated metrics safely over DOM components
    elements.sheetSubtotal.textContent = `₹${totalGrossMRPValue.toFixed(2)}`;
    elements.sheetDiscount.textContent = `-₹${totalAbsoluteSavingsValue.toFixed(2)}`;
    elements.sheetGrandTotal.textContent = `₹${grandNetPayableTotal.toFixed(2)}`;

    // Toggle and manage the Margin Scheme Savings Alert Display component
    if (totalAbsoluteSavingsValue > 0) {
        elements.sheetSavingsValue.textContent = `₹${totalAbsoluteSavingsValue.toFixed(2)}`;
        elements.sheetSavingsBox.style.visibility = "visible";
    } else {
        elements.sheetSavingsBox.style.visibility = "hidden";
    }
}

// Slice out target line entry sequence arrays row reference
function removeLineItem(targetId) {
    invoiceItems = invoiceItems.filter(item => item.id !== targetId);
    triggerToast("🗑️ Item removed from queue.");
    renderDataMatrixPipelines();
}

// Lightweight Toast Alert Engine
function triggerToast(msg) {
    const element = document.createElement('div');
    element.className = 'toast';
    element.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${msg}</span>`;
    elements.toastFrame.appendChild(element);
    
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'transform 0.3s, opacity 0.3s';
        setTimeout(() => element.remove(), 300);
    }, 2500);
}
