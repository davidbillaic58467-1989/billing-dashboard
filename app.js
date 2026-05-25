/* ==========================================================================
   SRS Corporation Premium Client-Side Controller
   Vanilla JavaScript | Indian Rupee Calculations | Android Mobile Optimization
   ========================================================================== */

// --- Global Application State ---
let state = {
  invoiceNumber: '',
  invoiceDate: '',
  customer: {
    name: '',
    email: '',
    phone: ''
  },
  items: [],
  taxRate: 18,
  shipping: 0.00
};

// --- DOM Cache ---
const DOM = {
  html: document.documentElement,
  themeToggle: document.getElementById('btn-theme-toggle'),
  btnDemo: document.getElementById('btn-demo'),
  btnClear: document.getElementById('btn-clear'),
  btnPrint: document.getElementById('btn-print'),
  btnPdf: document.getElementById('btn-pdf'),
  
  // Left form elements
  invNumber: document.getElementById('inv-number'),
  invDate: document.getElementById('inv-date'),
  custName: document.getElementById('cust-name'),
  custEmail: document.getElementById('cust-email'),
  custPhone: document.getElementById('cust-phone'),
  
  // Product input form
  addProductForm: document.getElementById('add-product-form'),
  prodName: document.getElementById('prod-name'),
  prodMrp: document.getElementById('prod-mrp'),
  prodActual: document.getElementById('prod-actual'),
  prodQty: document.getElementById('prod-qty'),
  discountHud: document.getElementById('discount-hud'),
  hudDiscountVal: document.getElementById('hud-discount-val'),
  
  // Summaries
  taxRateSelect: document.getElementById('tax-rate'),
  shippingCost: document.getElementById('shipping-cost'),
  
  // Control Tables
  itemsTableBody: document.getElementById('items-table-body'),
  itemCountBadge: document.getElementById('item-count-badge'),
  
  // Preview Elements
  previewInvNo: document.getElementById('preview-inv-no'),
  previewCustName: document.getElementById('preview-cust-name'),
  previewCustEmail: document.getElementById('preview-cust-email'),
  previewCustPhone: document.getElementById('preview-cust-phone'),
  previewInvDate: document.getElementById('preview-inv-date'),
  previewItemsBody: document.getElementById('preview-items-body'),
  
  // Live calculations
  savingsBox: document.getElementById('savings-box'),
  previewSavingsVal: document.getElementById('preview-savings-val'),
  previewSubtotal: document.getElementById('preview-subtotal'),
  previewDiscountTotal: document.getElementById('preview-discount-total'),
  previewTaxLabel: document.getElementById('preview-tax-label'),
  previewTaxAmount: document.getElementById('preview-tax-amount'),
  previewShippingRow: document.getElementById('preview-shipping-row'),
  previewShippingAmount: document.getElementById('preview-shipping-amount'),
  previewGrandTotal: document.getElementById('preview-grand-total'),
  
  // Mobile Android Tabs
  tabEdit: document.getElementById('tab-edit'),
  tabPreview: document.getElementById('tab-preview'),
  controlPanel: document.querySelector('.control-panel'),
  previewPanel: document.querySelector('.preview-panel'),
  
  // Drawer / Logs
  toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initDefaults();
  initEventListeners();
  initMobileTabs();
  loadSavedState();
  lucide.createIcons();
});

// Set default initial values
function initDefaults() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  
  state.invoiceDate = `${yyyy}-${mm}-${dd}`;
  state.invoiceNumber = `INV-${yyyy}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  
  DOM.invDate.value = state.invoiceDate;
  DOM.invNumber.value = state.invoiceNumber;
  
  updatePreviewMeta();
}

// --- Event Listeners Configuration ---
function initEventListeners() {
  DOM.themeToggle.addEventListener('click', toggleTheme);
  
  DOM.btnDemo.addEventListener('click', loadDemoData);
  DOM.btnClear.addEventListener('click', resetAll);
  DOM.btnPrint.addEventListener('click', () => window.print());
  DOM.btnPdf.addEventListener('click', generatePDF);
  
  DOM.invNumber.addEventListener('input', (e) => {
    state.invoiceNumber = e.target.value;
    updatePreviewMeta();
    saveDraft();
  });
  DOM.invDate.addEventListener('input', (e) => {
    state.invoiceDate = e.target.value;
    updatePreviewMeta();
    saveDraft();
  });
  DOM.custName.addEventListener('input', (e) => {
    state.customer.name = e.target.value;
    updatePreviewMeta();
    saveDraft();
  });
  DOM.custEmail.addEventListener('input', (e) => {
    state.customer.email = e.target.value;
    updatePreviewMeta();
    saveDraft();
  });
  DOM.custPhone.addEventListener('input', (e) => {
    state.customer.phone = e.target.value;
    updatePreviewMeta();
    saveDraft();
  });
  
  DOM.prodMrp.addEventListener('input', updateProductHud);
  DOM.prodActual.addEventListener('input', updateProductHud);
  DOM.prodQty.addEventListener('input', updateProductHud);
  
  DOM.taxRateSelect.addEventListener('change', (e) => {
    state.taxRate = parseFloat(e.target.value);
    calculateInvoice();
    saveDraft();
  });
  DOM.shippingCost.addEventListener('input', (e) => {
    state.shipping = parseFloat(e.target.value) || 0;
    calculateInvoice();
    saveDraft();
  });
  
  DOM.addProductForm.addEventListener('submit', handleAddProduct);
}

// --- Android Mobile Tabs Implementation ---
function initMobileTabs() {
  if (DOM.tabEdit && DOM.tabPreview && DOM.controlPanel && DOM.previewPanel) {
    DOM.tabEdit.addEventListener('click', () => {
      DOM.tabEdit.classList.add('active');
      DOM.tabPreview.classList.remove('active');
      
      DOM.controlPanel.classList.remove('hide-mobile');
      DOM.previewPanel.classList.add('hide-mobile');
      
      showToast('Switched to Editing Form', 'info');
    });
    
    DOM.tabPreview.addEventListener('click', () => {
      DOM.tabPreview.classList.add('active');
      DOM.tabEdit.classList.remove('active');
      
      DOM.previewPanel.classList.remove('hide-mobile');
      DOM.controlPanel.classList.add('hide-mobile');
      
      showToast('Switched to Live Receipt Preview', 'info');
    });
    
    if (window.innerWidth <= 768) {
      DOM.previewPanel.classList.add('hide-mobile');
    }
  }
}

// --- Theme Toggle Controller ---
function toggleTheme() {
  const currentTheme = DOM.html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  DOM.html.setAttribute('data-theme', newTheme);
  localStorage.setItem('srs-theme', newTheme);
  showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'info');
}

// --- Dynamic Product HUD ---
function updateProductHud() {
  const mrp = parseFloat(DOM.prodMrp.value) || 0;
  const actual = parseFloat(DOM.prodActual.value) || 0;
  const qty = parseInt(DOM.prodQty.value) || 1;
  
  if (mrp > 0 && actual > 0) {
    const savingsPerUnit = mrp - actual;
    const totalSavings = savingsPerUnit * qty;
    
    if (savingsPerUnit > 0) {
      const savingsPct = ((savingsPerUnit / mrp) * 100).toFixed(0);
      DOM.hudDiscountVal.textContent = `₹${totalSavings.toFixed(2)} (${savingsPct}% discount saved!)`;
      DOM.discountHud.style.background = 'rgba(16, 185, 129, 0.08)';
      DOM.discountHud.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      DOM.hudDiscountVal.style.color = 'var(--emerald-400)';
    } else if (savingsPerUnit < 0) {
      DOM.hudDiscountVal.textContent = 'Actual rate is higher than MRP. Verify prices.';
      DOM.discountHud.style.background = 'rgba(239, 68, 68, 0.08)';
      DOM.discountHud.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      DOM.hudDiscountVal.style.color = 'var(--rose-400)';
    } else {
      DOM.hudDiscountVal.textContent = '₹0.00 (No discount offered)';
      DOM.discountHud.style.background = 'rgba(255, 255, 255, 0.03)';
      DOM.discountHud.style.borderColor = 'var(--surface-border)';
      DOM.hudDiscountVal.style.color = 'var(--text-muted)';
    }
  } else {
    DOM.hudDiscountVal.textContent = '₹0.00 (0%)';
  }
}

// --- Sync Billed To Info to Preview Sheet ---
function updatePreviewMeta() {
  DOM.previewInvNo.textContent = state.invoiceNumber || 'INV-XXXX';
  DOM.previewCustName.textContent = state.customer.name || 'Valued Customer';
  DOM.previewCustEmail.textContent = state.customer.email || 'customer@domain.com';
  DOM.previewCustPhone.textContent = state.customer.phone || '+91 98765 43210';
  
  if (state.invoiceDate) {
    const formattedDate = new Date(state.invoiceDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    DOM.previewInvDate.textContent = formattedDate;
  } else {
    DOM.previewInvDate.textContent = '--- --, ----';
  }
}

// --- Action: Add Product Line Item ---
function handleAddProduct(e) {
  e.preventDefault();
  
  const name = DOM.prodName.value.trim();
  const mrp = parseFloat(DOM.prodMrp.value);
  const actual = parseFloat(DOM.prodActual.value);
  const qty = parseInt(DOM.prodQty.value);
  
  if (!name || isNaN(mrp) || isNaN(actual) || isNaN(qty)) {
    showToast('Invalid input data. Please check item parameters.', 'danger');
    return;
  }
  
  const newItem = {
    id: Date.now(),
    name,
    mrp,
    actual,
    qty,
    discount: mrp - actual,
    total: qty * actual
  };
  
  state.items.push(newItem);
  
  DOM.prodName.value = '';
  DOM.prodMrp.value = '';
  DOM.prodActual.value = '';
  DOM.prodQty.value = 1;
  DOM.discountHud.style.background = 'rgba(255, 255, 255, 0.03)';
  DOM.hudDiscountVal.textContent = '₹0.00 (0%)';
  
  showToast(`Added: ${name} (x${qty})`, 'success');
  
  calculateInvoice();
  saveDraft();
  
  const lastRow = DOM.itemsTableBody.lastElementChild;
  if (lastRow) {
    lastRow.classList.add('item-row-animate');
  }
}

// --- Action: Delete Product Line Item ---
window.deleteItem = function(itemId) {
  const index = state.items.findIndex(item => item.id === itemId);
  if (index !== -1) {
    const deletedName = state.items[index].name;
    state.items.splice(index, 1);
    
    showToast(`Removed: ${deletedName}`, 'info');
    calculateInvoice();
    saveDraft();
  }
};

// --- Calculate & Re-render Entire Grid/Preview (INR) ---
function calculateInvoice() {
  let subtotalMrp = 0;
  let subtotalActual = 0;
  let totalSavings = 0;
  
  DOM.itemsTableBody.innerHTML = '';
  DOM.previewItemsBody.innerHTML = '';
  
  DOM.itemCountBadge.textContent = `${state.items.length} item${state.items.length !== 1 ? 's' : ''}`;
  
  if (state.items.length === 0) {
    DOM.itemsTableBody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="7">
          <div class="empty-state">
            <i data-lucide="package-open"></i>
            <p>No items added yet. Use the form above or click "Demo Data" to get started.</p>
          </div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    
    DOM.previewItemsBody.innerHTML = `
      <tr class="preview-empty-row">
        <td colspan="6" class="txt-center text-muted">
          No items currently listed on the invoice.
        </td>
      </tr>
    `;
    
    DOM.savingsBox.style.display = 'none';
    DOM.previewSubtotal.textContent = '₹0.00';
    DOM.previewDiscountTotal.textContent = '-₹0.00';
    DOM.previewTaxAmount.textContent = '₹0.00';
    DOM.previewShippingRow.style.display = 'none';
    DOM.previewGrandTotal.textContent = '₹0.00';
    return;
  }
  
  state.items.forEach((item) => {
    subtotalMrp += item.mrp * item.qty;
    subtotalActual += item.actual * item.qty;
    
    const discTotal = (item.mrp - item.actual) * item.qty;
    const discPct = item.mrp > 0 ? (((item.mrp - item.actual) / item.mrp) * 100).toFixed(0) : 0;
    
    const trLeft = document.createElement('tr');
    trLeft.innerHTML = `
      <td>
        <div class="item-title-desc" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
      </td>
      <td class="txt-center val-mono">${item.qty}</td>
      <td class="txt-right val-mono">₹${item.mrp.toFixed(2)}</td>
      <td class="txt-right val-mono">₹${item.actual.toFixed(2)}</td>
      <td class="txt-right">
        ${discTotal > 0 ? `<span class="discount-saved-pill">-₹${discTotal.toFixed(2)} (${discPct}%)</span>` : '<span class="text-muted">-</span>'}
      </td>
      <td class="txt-right val-mono font-bold">₹${item.total.toFixed(2)}</td>
      <td class="txt-center">
        <button onclick="deleteItem(${item.id})" class="btn-delete" title="Delete Item">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    `;
    DOM.itemsTableBody.appendChild(trLeft);
    
    const trRight = document.createElement('tr');
    trRight.innerHTML = `
      <td style="font-weight: 500;">${escapeHtml(item.name)}</td>
      <td class="txt-center">${item.qty}</td>
      <td class="txt-right">₹${item.mrp.toFixed(2)}</td>
      <td class="txt-right">₹${item.actual.toFixed(2)}</td>
      <td class="txt-right" style="color: #059669; font-weight: 500;">
        ${discTotal > 0 ? `-₹${discTotal.toFixed(2)}` : '-'}
      </td>
      <td class="txt-right" style="font-weight: 600;">₹${item.total.toFixed(2)}</td>
    `;
    DOM.previewItemsBody.appendChild(trRight);
  });
  
  lucide.createIcons();
  
  totalSavings = subtotalMrp - subtotalActual;
  const taxAmount = subtotalActual * (state.taxRate / 100);
  const grandTotal = subtotalActual + taxAmount + state.shipping;
  
  DOM.previewSubtotal.textContent = `₹${subtotalActual.toFixed(2)}`;
  
  if (totalSavings > 0) {
    DOM.previewDiscountTotal.textContent = `-₹${totalSavings.toFixed(2)}`;
    DOM.previewSavingsVal.textContent = `₹${totalSavings.toFixed(2)}`;
    DOM.savingsBox.style.display = 'block';
  } else {
    DOM.previewDiscountTotal.textContent = `-₹0.00`;
    DOM.savingsBox.style.display = 'none';
  }
  
  DOM.previewTaxLabel.textContent = `Tax (${state.taxRate}%):`;
  DOM.previewTaxAmount.textContent = `₹${taxAmount.toFixed(2)}`;
  
  if (state.shipping > 0) {
    DOM.previewShippingAmount.textContent = `₹${state.shipping.toFixed(2)}`;
    DOM.previewShippingRow.style.display = 'flex';
  } else {
    DOM.previewShippingRow.style.display = 'none';
  }
  
  DOM.previewGrandTotal.textContent = `₹${grandTotal.toFixed(2)}`;
}

// --- Action: Generate & Save PDF ---
function generatePDF() {
  const element = document.getElementById('invoice-sheet');
  
  if (state.items.length === 0) {
    showToast('Invoice is empty! Please add some line items.', 'danger');
    return;
  }
  
  showToast('Compiling PDF... Please wait.', 'info');
  
  const options = {
    margin: 10,
    filename: `${state.invoiceNumber || 'invoice'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  
  html2pdf().set(options).from(element).save().then(() => {
    showToast('Invoice PDF downloaded successfully!', 'success');
    logInvoiceHistory();
  }).catch((err) => {
    console.error(err);
    showToast('Failed to export PDF.', 'danger');
  });
}

// --- Invoice Logging History System ---
function logInvoiceHistory() {
  let logs = JSON.parse(localStorage.getItem('srs-billing-history')) || [];
  
  const record = {
    id: Date.now(),
    number: state.invoiceNumber,
    date: state.invoiceDate,
    customer: state.customer.name || 'Valued Customer',
    itemsCount: state.items.reduce((acc, curr) => acc + curr.qty, 0),
    total: state.items.reduce((acc, curr) => acc + (curr.actual * curr.qty), 0)
  };
  
  if (!logs.some(log => log.number === record.number)) {
    logs.unshift(record);
    localStorage.setItem('srs-billing-history', JSON.stringify(logs));
  }
}

// --- Load / Save Local Draft States ---
function saveDraft() {
  localStorage.setItem('srs-billing-draft', JSON.stringify(state));
}

function loadSavedState() {
  const savedTheme = localStorage.getItem('srs-theme');
  if (savedTheme) {
    DOM.html.setAttribute('data-theme', savedTheme);
  }
  
  const savedDraft = localStorage.getItem('srs-billing-draft');
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      state = { ...state, ...parsed };
      
      DOM.invNumber.value = state.invoiceNumber;
      DOM.invDate.value = state.invoiceDate;
      DOM.custName.value = state.customer.name;
      DOM.custEmail.value = state.customer.email;
      DOM.custPhone.value = state.customer.phone;
      DOM.taxRateSelect.value = state.taxRate;
      DOM.shippingCost.value = state.shipping.toFixed(2);
      
      updatePreviewMeta();
      calculateInvoice();
    } catch (e) {
      console.error('Error parsing draft state:', e);
    }
  }
}

// --- Action: Reset Forms ---
function resetAll() {
  if (confirm('Are you sure you want to reset all fields? All current invoice details will be deleted.')) {
    state.customer = { name: '', email: '', phone: '' };
    state.items = [];
    state.shipping = 0.00;
    state.taxRate = 18;
    
    DOM.custName.value = '';
    DOM.custEmail.value = '';
    DOM.custPhone.value = '';
    DOM.taxRateSelect.value = 18;
    DOM.shippingCost.value = '0.00';
    
    initDefaults();
    calculateInvoice();
    saveDraft();
    
    showToast('Invoice application reset complete.', 'info');
  }
}

// --- Action: Load Premium Indian Business Preset Data ---
function loadDemoData() {
  state.customer = {
    name: 'Anand Sharma',
    email: 'anand.sharma@gmail.com',
    phone: '+91 94432 56710'
  };
  
  // Updated demo values to reflect Healthcare, Skincare, Personalcare, Oralcare, and Homecare lines
  state.items = [
    {
      id: 1,
      name: 'Advanced Healthcare Multivitamin & Wellness Kit',
      mrp: 2450.00,
      actual: 1999.00,
      qty: 2,
      discount: 451.00,
      total: 3998.00
    },
    {
      id: 2,
      name: 'Hydrating Glow Skincare Serum (Premium Range)',
      mrp: 1200.00,
      actual: 950.00,
      qty: 3,
      discount: 250.00,
      total: 2850.00
    },
    {
      id: 3,
      name: 'Complete Oralcare Charcoal Protection Toothpaste Pack',
      mrp: 450.00,
      actual: 450.00,
      qty: 5,
      discount: 0.00,
      total: 2250.00
    },
    {
      id: 4,
      name: 'Eco-Friendly Concentrated Homecare Liquid Detergent',
      mrp: 850.00,
      actual: 720.00,
      qty: 2,
      discount: 130.00,
      total: 1440.00
    }
  ];
  
  state.shipping = 120.00;
  state.taxRate = 18;
  
  DOM.custName.value = state.customer.name;
  DOM.custEmail.value = state.customer.email;
  DOM.custPhone.value = state.customer.phone;
  DOM.taxRateSelect.value = state.taxRate;
  DOM.shippingCost.value = state.shipping.toFixed(2);
  
  updatePreviewMeta();
  calculateInvoice();
  saveDraft();
  
  showToast('SRS Corporation FMCG & Retail demo data loaded.', 'success');
}

// --- Toast System Helper ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  
  DOM.toastContainer.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Utility Functions ---
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
