// =========================================================================
// PayableDesk Configuration & URL Query Sync Engine
// =========================================================================
const CONFIG = {
  // Enter your deployed Google Apps Script URL here so that any user opening the dashboard gets live data automatically.
  // Example: 'https://script.google.com/macros/s/AKfycb...exec'
  defaultSheetsUrl: 'https://script.google.com/macros/s/AKfycbx_MnEIbq5lvZ3E2yV0v2LOEuianY45kEdb_BdWF__vNEa6ToZVCOYuzx9pyf_dndpt/exec', 
  autoSyncDefault: true
};

// Automatically detects and saves the Google Sheet URL if shared in the link.
(function detectQueryUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sheetUrlParam = urlParams.get('sheetUrl') || urlParams.get('url') || urlParams.get('sheet');
    if (sheetUrlParam && sheetUrlParam.includes('script.google.com')) {
      localStorage.setItem('imarat-sheets-url', sheetUrlParam.trim());
      localStorage.setItem('imarat-sheets-auto', 'true');
      // Clean up URL parameter in address bar without reloading
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  } catch(e) { console.warn('Query check failed:', e); }
})();

function getSheetsUrl() {
  return localStorage.getItem('imarat-sheets-url') || CONFIG.defaultSheetsUrl || '';
}

function isAutoSyncEnabled() {
  const saved = localStorage.getItem('imarat-sheets-auto');
  if (saved !== null) {
    return saved === 'true';
  }
  return CONFIG.autoSyncDefault;
}

// Accounts Payable Dashboard Application State
const STATE = {
  theme: localStorage.getItem('ap-dashboard-theme') || 'dark',
  activeTab: 'page-open-po',
  
  // 1. Purchase Orders Database
  purchaseOrders: [
    { poNumber: 'PO-2026-0042', vendor: 'Vertex Solutions Inc.', date: '2026-05-10', deliveryDate: '2026-06-15', totalValue: 420000, invoicedValue: 315000, status: 'partially invoiced', companyCode: 'IM-01' },
    { poNumber: 'PO-2026-0043', vendor: 'Starlight Industries', date: '2026-05-12', deliveryDate: '2026-06-01', totalValue: 150000, invoicedValue: 150000, status: 'open', companyCode: 'IM-02' },
    { poNumber: 'PO-2026-0044', vendor: 'Global Logistics LLC', date: '2026-05-14', deliveryDate: '2026-05-30', totalValue: 68500, invoicedValue: 24000, status: 'overdue', companyCode: 'IM-03' },
    { poNumber: 'PO-2026-0045', vendor: 'Aapex Power Grid', date: '2026-05-18', deliveryDate: '2026-06-10', totalValue: 85000, invoicedValue: 0, status: 'open', companyCode: 'IM-01' },
    { poNumber: 'PO-2026-0046', vendor: 'Pinnacle Paper Co.', date: '2026-05-20', deliveryDate: '2026-06-02', totalValue: 25000, invoicedValue: 25000, status: 'open', companyCode: 'IM-02' },
    { poNumber: 'PO-2026-0047', vendor: 'Titan Engineering Corp', date: '2026-05-22', deliveryDate: '2026-05-28', totalValue: 310000, invoicedValue: 180000, status: 'overdue', companyCode: 'IM-03' },
    { poNumber: 'PO-2026-0048', vendor: 'Apex Software Corp', date: '2026-05-25', deliveryDate: '2026-06-25', totalValue: 125000, invoicedValue: 35000, status: 'partially invoiced', companyCode: 'IM-01' },
    { poNumber: 'PO-2026-0049', vendor: 'BlueRidge Security', date: '2026-05-28', deliveryDate: '2026-06-28', totalValue: 42300, invoicedValue: 0, status: 'open', companyCode: 'IM-02' },
    { poNumber: 'PO-2026-0050', vendor: 'Swift Courier Corp', date: '2026-05-29', deliveryDate: '2026-06-05', totalValue: 15000, invoicedValue: 12000, status: 'partially invoiced', companyCode: 'IM-03' },
    { poNumber: 'PO-2026-0051', vendor: 'Zenith Legal Advisors', date: '2026-06-01', deliveryDate: '2026-07-01', totalValue: 185000, invoicedValue: 0, status: 'open', companyCode: 'IM-01' }
  ],

  // 2. Chart of Accounts (COA) / GL Budget Data
  coaAccounts: [
    { code: '5100', name: 'Raw Materials & Inventory', category: 'direct', spend: 85200, budget: 120000, companyCode: 'IM-01' },
    { code: '6100', name: 'Rent & Facility Leases', category: 'indirect', spend: 42500, budget: 50000, companyCode: 'IM-02' },
    { code: '6200', name: 'Electricity & Water Utilities', category: 'indirect', spend: 18400, budget: 15000, companyCode: 'IM-03' }, // Over Budget
    { code: '6300', name: 'IT Infrastructure & SaaS', category: 'indirect', spend: 28250, budget: 35000, companyCode: 'IM-01' },
    { code: '6400', name: 'Marketing & Ad Spend', category: 'indirect', spend: 25000, budget: 40000, companyCode: 'IM-02' },
    { code: '6500', name: 'Professional Services & Fees', category: 'indirect', spend: 22500, budget: 20000, companyCode: 'IM-03' }, // Over Budget
    { code: '6600', name: 'Office Supplies & Expense', category: 'indirect', spend: 3200, budget: 6000, companyCode: 'IM-01' },
    { code: '6700', name: 'Travel & Client Entertainment', category: 'indirect', spend: 9200, budget: 15000, companyCode: 'IM-02' }
  ],

  // 3. Daily Invoice Processing Log
  dailyLog: [
    { date: '2026-06-03', timestamp: '08:15 AM', invoiceId: 'INV-94285', vendor: 'Vertex Solutions Inc.', amount: 45000, poRef: 'PO-2026-0042', processor: 'Finance Executive 1', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-06-03', timestamp: '08:42 AM', invoiceId: 'INV-29472', vendor: 'Starlight Industries', amount: 15000, poRef: 'PO-2026-0043', processor: 'Finance Executive 2', matchStatus: 'pass', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-06-03', timestamp: '09:12 AM', invoiceId: 'INV-83742', vendor: 'Global Logistics LLC', amount: 24000, poRef: 'PO-2026-0044', processor: 'Finance Executive 3', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    { date: '2026-06-03', timestamp: '09:55 AM', invoiceId: 'INV-10492', vendor: 'Apex Software Corp', amount: 35000, poRef: 'PO-2026-0048', processor: 'Sr. Finance Executive', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-06-03', timestamp: '10:05 AM', invoiceId: 'INV-48201', vendor: 'Titan Engineering Corp', amount: 90000, poRef: 'PO-2026-0047', processor: 'Finance Executive 1', matchStatus: 'fail', status: 'duplicate hold', companyCode: 'IM-03' },
    { date: '2026-06-03', timestamp: '10:20 AM', invoiceId: 'INV-91204', vendor: 'Swift Courier Corp', amount: 12000, poRef: 'PO-2026-0050', processor: 'Document Controller', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    { date: '2026-06-03', timestamp: '10:22 AM', invoiceId: 'INV-39401', vendor: 'Starlight Industries', amount: 18000, poRef: 'PO-2026-0043', processor: 'Sr. Finance Executive', matchStatus: 'fail', status: 'pending approval', companyCode: 'IM-02' },
    
    // Older historical logs (May 2026) to fill out weeks
    { date: '2026-05-28', timestamp: '11:15 AM', invoiceId: 'INV-94101', vendor: 'Vertex Solutions Inc.', amount: 80000, poRef: 'PO-2026-0042', processor: 'Finance Executive 1', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-25', timestamp: '02:30 PM', invoiceId: 'INV-94102', vendor: 'BlueRidge Security', amount: 20000, poRef: 'PO-2026-0049', processor: 'Finance Executive 3', matchStatus: 'pass', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-05-24', timestamp: '04:10 PM', invoiceId: 'INV-94103', vendor: 'Starlight Industries', amount: 30000, poRef: 'PO-2026-0043', processor: 'Finance Executive 2', matchStatus: 'pass', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-05-21', timestamp: '09:15 AM', invoiceId: 'INV-94104', vendor: 'Titan Engineering Corp', amount: 50000, poRef: 'PO-2026-0047', processor: 'Sr. Finance Executive', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    { date: '2026-05-20', timestamp: '10:45 AM', invoiceId: 'INV-94105', vendor: 'Pinnacle Paper Co.', amount: 25000, poRef: 'PO-2026-0046', processor: 'Finance Executive 1', matchStatus: 'pass', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-05-18', timestamp: '01:20 PM', invoiceId: 'INV-94106', vendor: 'Vertex Solutions Inc.', amount: 60000, poRef: 'PO-2026-0042', processor: 'Finance Executive 2', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-15', timestamp: '03:15 PM', invoiceId: 'INV-94107', vendor: 'Apex Software Corp', amount: 20000, poRef: 'PO-2026-0048', processor: 'Finance Executive 3', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-12', timestamp: '11:00 AM', invoiceId: 'INV-94108', vendor: 'Global Logistics LLC', amount: 15000, poRef: 'PO-2026-0044', processor: 'Document Controller', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    { date: '2026-05-09', timestamp: '02:00 PM', invoiceId: 'INV-94109', vendor: 'Vertex Solutions Inc.', amount: 70000, poRef: 'PO-2026-0042', processor: 'Finance Executive 1', matchStatus: 'pass', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-06', timestamp: '09:30 AM', invoiceId: 'INV-94110', vendor: 'Titan Engineering Corp', amount: 40000, poRef: 'PO-2026-0047', processor: 'Sr. Finance Executive', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    { date: '2026-05-04', timestamp: '11:30 AM', invoiceId: 'INV-94111', vendor: 'Starlight Industries', amount: 45000, poRef: 'PO-2026-0043', processor: 'Finance Executive 2', matchStatus: 'pass', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-05-02', timestamp: '04:45 PM', invoiceId: 'INV-94112', vendor: 'Global Logistics LLC', amount: 9000, poRef: 'PO-2026-0044', processor: 'Finance Executive 3', matchStatus: 'pass', status: 'approved', companyCode: 'IM-03' },
    
    // Older Non-PO Approved Invoices to fill out non-PO spends and compliance charts
    { date: '2026-05-27', timestamp: '10:00 AM', invoiceId: 'NPO-88100', vendor: 'Interstate Power Grid', amount: 8000, poRef: 'Non-PO', processor: 'Manager Payable', matchStatus: 'na', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-22', timestamp: '11:30 AM', invoiceId: 'NPO-88101', vendor: 'Wellesley Legal Group', amount: 15000, poRef: 'Non-PO', processor: 'Manager Payable', matchStatus: 'na', status: 'approved', companyCode: 'IM-02' },
    { date: '2026-05-14', timestamp: '02:00 PM', invoiceId: 'NPO-88102', vendor: 'Digital Horizon Agency', amount: 12000, poRef: 'Non-PO', processor: 'Manager Payable', matchStatus: 'na', status: 'approved', companyCode: 'IM-01' },
    { date: '2026-05-08', timestamp: '04:15 PM', invoiceId: 'NPO-88103', vendor: 'Interstate Power Grid', amount: 7000, poRef: 'Non-PO', processor: 'Manager Payable', matchStatus: 'na', status: 'approved', companyCode: 'IM-03' }
  ],

  // 4. Non-PO Invoices that need Manual GL coding
  nonPoQueue: [
    { id: 'NPO-88231', vendor: 'Interstate Power Grid', amount: 3400, date: '2026-06-02', defaultCoa: '6200', companyCode: 'IM-01' },
    { id: 'NPO-19402', vendor: 'Wellesley Legal Group', amount: 12500, date: '2026-06-02', defaultCoa: '6500', companyCode: 'IM-02' },
    { id: 'NPO-58201', vendor: 'Pinnacle Paper Co.', amount: 450, date: '2026-06-03', defaultCoa: '6600', companyCode: 'IM-03' },
    { id: 'NPO-77402', vendor: 'Digital Horizon Agency', amount: 8000, date: '2026-06-03', defaultCoa: '6400', companyCode: 'IM-01' }
  ],

  // 30-day compliance aggregates (historical charts)
  poComplianceCount: 188,
  nonPoComplianceCount: 52
};

// ── LocalStorage: load any previously saved state immediately ──
(function loadSavedState() {
  try {
    const raw = localStorage.getItem('imarat-ap-data');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.purchaseOrders?.length)          STATE.purchaseOrders          = d.purchaseOrders;
    if (d.dailyLog?.length)                STATE.dailyLog                = d.dailyLog;
    if (d.nonPoQueue !== undefined)        STATE.nonPoQueue              = d.nonPoQueue;
    if (d.coaAccounts?.length)             STATE.coaAccounts             = d.coaAccounts;
    if (d.poComplianceCount    != null)    STATE.poComplianceCount       = d.poComplianceCount;
    if (d.nonPoComplianceCount != null)    STATE.nonPoComplianceCount    = d.nonPoComplianceCount;
  } catch(e) { /* silently ignore */ }
})();

// Global object to cache active Chart instances
const activeCharts = {};

// Document elements cache
const DOM = {
  html: document.documentElement,
  themeToggle: document.getElementById('theme-toggle'),
  themeIconLight: document.getElementById('theme-icon-light'),
  themeIconDark: document.getElementById('theme-icon-dark'),
  pageTitle: document.getElementById('current-page-title'),
  pageSubtitle: document.getElementById('current-page-subtitle'),
  navItems: document.querySelectorAll('.nav-item'),
  pages: document.querySelectorAll('.dashboard-page'),
  toastContainer: document.getElementById('toast-container'),

  // Open PO elements
  poTableBody: document.getElementById('po-table-body'),
  poSearch: document.getElementById('po-search'),
  poStatusFilter: document.getElementById('po-status-filter'),
  poKpiValue: document.getElementById('po-kpi-value'),
  poKpiCount: document.getElementById('po-kpi-count'),
  poKpiOverdue: document.getElementById('po-kpi-overdue'),
  poKpiVendors: document.getElementById('po-kpi-vendors'),



  // Daily Log elements
  logTableBody: document.getElementById('log-table-body'),
  logSearch: document.getElementById('log-search'),
  logStatusFilter: document.getElementById('log-status-filter'),
  logKpiProcessed: document.getElementById('log-kpi-processed'),
  logKpiReceived: document.getElementById('log-kpi-received'),
  logKpiHold: document.getElementById('log-kpi-hold'),
  openInvoiceModalBtn: document.getElementById('open-invoice-modal-btn'),
  invoiceModalOverlay: document.getElementById('invoice-modal-overlay'),
  closeInvoiceModalBtn: document.getElementById('close-invoice-modal-btn'),
  cancelInvoiceModalBtn: document.getElementById('cancel-invoice-modal-btn'),
  invoiceForm: document.getElementById('invoice-form'),
  modalPoSelect: document.getElementById('modal-po-select'),
  modalCoaSelect: document.getElementById('modal-coa'),

  // COA elements
  coaTableBody: document.getElementById('coa-table-body'),
  coaGroupFilter: document.getElementById('coa-group-filter'),
  coaKpiSpend: document.getElementById('coa-kpi-spend'),
  coaKpiCount: document.getElementById('coa-kpi-count'),
  coaKpiBudgetPass: document.getElementById('coa-kpi-budget-pass'),
  coaKpiBudgetFail: document.getElementById('coa-kpi-budget-fail'),

  // Date filter elements
  poDateFrom: document.getElementById('po-date-from'),
  poDateTo: document.getElementById('po-date-to'),
  logDateFilter: document.getElementById('log-date-filter'),

  coaDateFrom: document.getElementById('coa-date-from'),
  coaDateTo: document.getElementById('coa-date-to')
};

// Colors based on theme for Chart rendering
function getThemeColors() {
  const isDark = STATE.theme === 'dark';
  return {
    text: isDark ? '#94a3b8' : '#475569',
    grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    primary: isDark ? '#10b981' : '#059669', // Emerald
    primaryLight: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)',
    secondary: isDark ? '#0ea5e9' : '#0284c7', // Sky
    purple: isDark ? '#a855f7' : '#7c3aed', // Purple
    warning: isDark ? '#f59e0b' : '#d97706', // Amber
    danger: isDark ? '#ef4444' : '#dc2626', // Rose
    cardBg: isDark ? 'rgba(18, 25, 41, 0.7)' : 'rgba(255, 255, 255, 0.85)'
  };
}

// Global utility formatting functions — Pakistani Rupee (PKR)
const formatCurrency = (val) => 'PKR ' + new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(val);
const formatPercentage = (val) => `${val.toFixed(1)}%`;

// Notification Alert system
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast`;
  toast.style.borderColor = type === 'success' ? 'var(--accent-primary)' : type === 'warning' ? 'var(--accent-warning)' : 'var(--accent-danger)';
  
  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'error') icon = 'x-circle';

  toast.innerHTML = `
    <i data-feather="${icon}" style="width: 20px; height: 20px;"></i>
    <span>${message}</span>
  `;
  DOM.toastContainer.appendChild(toast);
  feather.replace({ parent: toast });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Set theme mode (light/dark)
function setTheme(theme) {
  STATE.theme = theme;
  localStorage.setItem('ap-dashboard-theme', theme);
  DOM.html.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    DOM.themeIconLight.style.display = 'none';
    DOM.themeIconDark.style.display = 'block';
  } else {
    DOM.themeIconLight.style.display = 'block';
    DOM.themeIconDark.style.display = 'none';
  }

  // Refresh active page charts with new theme axes colors
  renderCharts();
}

// Initialise Application Theme
setTheme(STATE.theme);
DOM.themeToggle.addEventListener('click', () => {
  setTheme(STATE.theme === 'dark' ? 'light' : 'dark');
});

// Sidebar Navigation
DOM.navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.getAttribute('data-target');
    
    // Switch Active Nav Item
    DOM.navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Switch Visible Dashboard Page
    DOM.pages.forEach(page => {
      page.classList.remove('active');
      if (page.id === target) {
        page.classList.add('active');
      }
    });

    STATE.activeTab = target;
    
    // Set Header Titles
    let title = "Open PO Report";
    let subtitle = "Track and analyze open purchase orders and vendor encumbrances";
    if (target === 'page-daily-log') {
      title = "Daily Activity Log";
      subtitle = "Register invoice transactions, match invoices, and audit pipelines";
    } else if (target === 'page-coa-wise') {
      title = "Executive Summary Report";
      subtitle = "Consolidated departmental spend, COA allocation & budget performance overview";
    }
    
    if (DOM.pageTitle) DOM.pageTitle.textContent = title;
    if (DOM.pageSubtitle) DOM.pageSubtitle.textContent = subtitle;

    // Refresh charts for visual animations on entry
    renderCharts();
  });
});

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────
function switchPage(target) {
  // Update desktop sidebar
  DOM.navItems.forEach(n => n.classList.remove('active'));
  const desktopNav = document.querySelector(`.nav-item[data-target="${target}"]`);
  if (desktopNav) desktopNav.classList.add('active');

  // Update mobile bottom nav
  document.querySelectorAll('.mobile-nav-item[data-target]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === target);
  });

  // Update horizontal top nav tabs
  document.querySelectorAll('.nav-tab[data-target]').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-target') === target);
  });

  // Show correct page
  DOM.pages.forEach(page => {
    page.classList.toggle('active', page.id === target);
  });

  STATE.activeTab = target;

  // Update header title
  const titles = {
    'page-open-po':      ['Open PO Report',          'Track and analyze open purchase orders and vendor encumbrances'],

    'page-daily-log':    ['Daily Activity Log',        'Register invoice transactions, match invoices, and audit pipelines'],
    'page-coa-wise':     ['Executive Summary Report',  'Consolidated departmental spend, COA allocation & budget performance overview']
  };
  const [title, subtitle] = titles[target] || ['Dashboard', ''];
  if (DOM.pageTitle) DOM.pageTitle.textContent = title;
  if (DOM.pageSubtitle) DOM.pageSubtitle.textContent = subtitle;

  // Scroll to top on mobile page switch
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderCharts();
}

document.querySelectorAll('.mobile-nav-item[data-target]').forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.getAttribute('data-target')));
});

// Horizontal Top Nav Tabs
document.querySelectorAll('.nav-tab[data-target]').forEach(tab => {
  tab.addEventListener('click', () => switchPage(tab.getAttribute('data-target')));
});




/* =========================================================================
   GLOBAL FILTER ENGINE (DASHBOARD REDESIGN)
   ========================================================================= */

function getFilteredData() {
  const company = document.getElementById('global-company-filter').value;
  const dateFrom = document.getElementById('global-date-from').value;
  const dateTo = document.getElementById('global-date-to').value;
  const vendor = document.getElementById('global-vendor-filter').value.toLowerCase();

  const pos = STATE.purchaseOrders.filter(po => {
    const matchesCompany = company === 'all' || po.companyCode === company;
    const matchesDateFrom = !dateFrom || po.date >= dateFrom;
    const matchesDateTo = !dateTo || po.date <= dateTo;
    const matchesVendor = !vendor || po.vendor.toLowerCase().includes(vendor);
    return matchesCompany && matchesDateFrom && matchesDateTo && matchesVendor;
  });

  const logs = STATE.dailyLog.filter(log => {
    const matchesCompany = company === 'all' || log.companyCode === company;
    const matchesDateFrom = !dateFrom || log.date >= dateFrom;
    const matchesDateTo = !dateTo || log.date <= dateTo;
    const matchesVendor = !vendor || log.vendor.toLowerCase().includes(vendor);
    return matchesCompany && matchesDateFrom && matchesDateTo && matchesVendor;
  });

  const npoQueue = STATE.nonPoQueue.filter(npo => {
    const matchesCompany = company === 'all' || npo.companyCode === company;
    const matchesDateFrom = !dateFrom || npo.date >= dateFrom;
    const matchesDateTo = !dateTo || npo.date <= dateTo;
    const matchesVendor = !vendor || npo.vendor.toLowerCase().includes(vendor);
    return matchesCompany && matchesDateFrom && matchesDateTo && matchesVendor;
  });

  const coas = STATE.coaAccounts.filter(coa => {
    const matchesCompany = company === 'all' || coa.companyCode === company;
    return matchesCompany;
  });

  return { pos, logs, npoQueue, coas };
}

// Global Filter change event listeners
document.getElementById('global-company-filter').addEventListener('change', refreshAll);
document.getElementById('global-date-from').addEventListener('change', refreshAll);
document.getElementById('global-date-to').addEventListener('change', refreshAll);
document.getElementById('global-vendor-filter').addEventListener('input', refreshAll);
document.getElementById('reset-global-filters-btn').addEventListener('click', () => {
  document.getElementById('global-company-filter').value = 'all';
  document.getElementById('global-date-from').value = '';
  document.getElementById('global-date-to').value = '';
  document.getElementById('global-vendor-filter').value = '';
  DOM.poStatusFilter.value = 'all';
  document.querySelectorAll('.interactive-kpi').forEach(c => c.classList.remove('active-filter'));
  refreshAll();
});

// Collapsible Filter Pane event triggers
const filterPane = document.getElementById('filter-pane');
const toggleFilterBtn = document.getElementById('toggle-filter-pane-btn');
const closeFilterBtn = document.getElementById('close-filter-btn');

if (toggleFilterBtn && filterPane) {
  toggleFilterBtn.addEventListener('click', () => {
    filterPane.classList.toggle('collapsed');
    setTimeout(renderCharts, 300);
  });
}
if (closeFilterBtn && filterPane) {
  closeFilterBtn.addEventListener('click', () => {
    filterPane.classList.add('collapsed');
    setTimeout(renderCharts, 300);
  });
}

// KPI Card click cross-filtering
function setupKpiCardInteractivity() {
  const openPoCard = document.getElementById('kpi-card-open-po-value');
  const overdueCard = document.getElementById('kpi-card-overdue-deliveries');
  const statusFilter = document.getElementById('po-status-filter');

  if (openPoCard && statusFilter) {
    openPoCard.addEventListener('click', () => {
      if (openPoCard.classList.contains('active-filter')) {
        openPoCard.classList.remove('active-filter');
        statusFilter.value = 'all';
      } else {
        openPoCard.classList.add('active-filter');
        if (overdueCard) overdueCard.classList.remove('active-filter');
        statusFilter.value = 'open';
      }
      updateOpenPoDashboard();
      renderCharts();
    });
  }

  if (overdueCard && statusFilter) {
    overdueCard.addEventListener('click', () => {
      if (overdueCard.classList.contains('active-filter')) {
        overdueCard.classList.remove('active-filter');
        statusFilter.value = 'all';
      } else {
        overdueCard.classList.add('active-filter');
        if (openPoCard) openPoCard.classList.remove('active-filter');
        statusFilter.value = 'overdue';
      }
      updateOpenPoDashboard();
      renderCharts();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      const val = statusFilter.value;
      if (openPoCard) openPoCard.classList.toggle('active-filter', val === 'open');
      if (overdueCard) overdueCard.classList.toggle('active-filter', val === 'overdue');
    });
  }
}

// Initialize card interactivity
setupKpiCardInteractivity();


/* =========================================================================
   1. DASHBOARD 1: OPEN PURCHASE ORDERS ENGINE
   ========================================================================= */

function updateOpenPoDashboard() {
  const { pos } = getFilteredData();
  const searchVal = DOM.poSearch.value.toLowerCase();
  const filterVal = DOM.poStatusFilter.value;

  // Calculate high level KPIs from filtered list
  let remainingPoValue = 0;
  let overdueCount = 0;
  const vendorsSet = new Set();

  pos.forEach(po => {
    remainingPoValue += (po.totalValue - po.invoicedValue);
    vendorsSet.add(po.vendor);
    if (po.status === 'overdue') overdueCount++;
  });

  DOM.poKpiValue.textContent = formatCurrency(remainingPoValue);
  DOM.poKpiCount.textContent = pos.filter(p => p.status !== 'fully invoiced').length;
  DOM.poKpiOverdue.textContent = overdueCount;
  DOM.poKpiVendors.textContent = vendorsSet.size;

  // Apply local table toolbar filters
  const filteredPos = pos.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchVal) || po.vendor.toLowerCase().includes(searchVal);
    const matchesFilter = filterVal === 'all' || po.status === filterVal;
    return matchesSearch && matchesFilter;
  });

  // Render Table rows
  DOM.poTableBody.innerHTML = filteredPos.map(po => {
    const remaining = po.totalValue - po.invoicedValue;
    const fulfillPercent = (po.invoicedValue / po.totalValue) * 100;
    
    let badgeClass = 'badge-open';
    if (po.status === 'partially invoiced') badgeClass = 'badge-partial';
    if (po.status === 'overdue') badgeClass = 'badge-overdue';

    return `
      <tr>
        <td style="font-family: var(--font-heading); font-weight: 600;">${po.poNumber}</td>
        <td>${po.vendor}</td>
        <td class="hide-mobile">${po.date}</td>
        <td class="hide-mobile">${po.deliveryDate}</td>
        <td class="hide-mobile" style="font-family: var(--font-heading); font-weight: 500;">${formatCurrency(po.totalValue)}</td>
        <td class="hide-mobile" style="font-family: var(--font-heading);">${formatCurrency(po.invoicedValue)}</td>
        <td style="font-family: var(--font-heading); font-weight: 600; color: var(--accent-secondary);">${formatCurrency(remaining)}</td>
        <td class="hide-mobile">
          <div class="progress-bar-wrapper">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${fulfillPercent}%"></div>
            </div>
            <span class="progress-percentage">${Math.round(fulfillPercent)}%</span>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${po.status}</span></td>
      </tr>
    `;
  }).join('');
}

// Bind PO controls
DOM.poSearch.addEventListener('input', updateOpenPoDashboard);
DOM.poStatusFilter.addEventListener('change', updateOpenPoDashboard);


/* =========================================================================
   2. DASHBOARD 2: PO VS NON-PO CASES ENGINE
   ========================================================================= */



// Function to trigger manual GL coding pipeline
window.codeNonPoInvoice = function(npoId) {
  const invoiceIndex = STATE.nonPoQueue.findIndex(i => i.id === npoId);
  if (invoiceIndex === -1) return;

  const npo = STATE.nonPoQueue[invoiceIndex];
  const selectedCoaCode = document.getElementById(`select-${npoId}`).value;
  const coa = STATE.coaAccounts.find(c => c.code === selectedCoaCode);

  // 1. Update State values
  if (coa) {
    coa.spend += npo.amount;
  }
  STATE.nonPoComplianceCount++;
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  STATE.dailyLog.unshift({
    date: todayStr,
    timestamp: timestamp,
    invoiceId: npo.id,
    vendor: npo.vendor,
    amount: npo.amount,
    poRef: 'Non-PO',
    processor: 'Manager Payable',
    matchStatus: 'na',
    status: 'approved',
    companyCode: npo.companyCode || 'IM-01'
  });

  saveState();

  // Remove from unmapped queue
  STATE.nonPoQueue.splice(invoiceIndex, 1);

  // Success response
  showToast(`Coded ${npo.id} to COA Account ${selectedCoaCode} successfully!`);
  
  // Refresh views and charts
  refreshAll();
};


/* =========================================================================
   3. DASHBOARD 3: DAILY TIMELINE / PROCESSOR LOGS
   ========================================================================= */

function updateDailyLogDashboard() {
  const { logs } = getFilteredData();
  const searchVal = DOM.logSearch.value.toLowerCase();
  const filterVal = DOM.logStatusFilter.value;

  // Metrics — case-insensitive status matching
  const processedToday = logs.filter(l => {
    const s = (l.status || '').toLowerCase().trim();
    return s !== 'duplicate hold' && s !== 'hold' && s !== 'on hold' && s !== 'rejected';
  }).length;
  const onHoldToday = logs.filter(l => {
    const s = (l.status || '').toLowerCase().trim();
    return s === 'duplicate hold' || s === 'hold' || s === 'on hold';
  }).length;
  const totalCount = logs.length;

  DOM.logKpiProcessed.textContent = processedToday;
  DOM.logKpiHold.textContent = onHoldToday;
  DOM.logKpiReceived.textContent = totalCount;

  // Apply local toolbar filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.invoiceId.toLowerCase().includes(searchVal) || log.vendor.toLowerCase().includes(searchVal);
    const matchesFilter = filterVal === 'all' || (log.status || '').toLowerCase().trim() === filterVal;
    return matchesSearch && matchesFilter;
  });

  // Table rows render
  DOM.logTableBody.innerHTML = filteredLogs.map(log => {
    let badgeClass = 'badge-approved';
    if (log.status === 'pending approval') badgeClass = 'badge-pending';
    if (log.status === 'duplicate hold') badgeClass = 'badge-hold';

    let matchIcon = '<span class="match-dot pass" title="3-Way Match Passed"></span>';
    if (log.matchStatus === 'fail') matchIcon = '<span class="match-dot fail" title="PO Discrepancy Found"></span>';
    if (log.matchStatus === 'na') matchIcon = '<span class="match-dot na" title="Not Applicable (Non-PO)"></span>';

    return `
      <tr>
        <td class="hide-mobile" style="color: var(--text-muted); font-size: 0.8rem;">${log.timestamp}</td>
        <td style="font-family: var(--font-heading); font-weight: 600;">${log.invoiceId}</td>
        <td>${log.vendor}</td>
        <td style="font-family: var(--font-heading); font-weight: 500;">${formatCurrency(log.amount)}</td>
        <td class="hide-mobile" style="font-size: 0.85rem; color: var(--text-secondary);">${log.poRef}</td>
        <td class="hide-mobile">${log.processor}</td>
        <td>
          <div class="match-checkbox-cell">
            ${matchIcon}
            <span style="font-size: 0.75rem; text-transform: uppercase;">${log.matchStatus}</span>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${log.status}</span></td>
      </tr>
    `;
  }).join('');
}

// Filters for Daily Log
DOM.logSearch.addEventListener('input', updateDailyLogDashboard);
DOM.logStatusFilter.addEventListener('change', updateDailyLogDashboard);

// Modal Controls
DOM.openInvoiceModalBtn.addEventListener('click', () => {
  // Reset fields
  DOM.invoiceForm.reset();
  
  // Populate PO Dropdown
  const poOptions = STATE.purchaseOrders
    .filter(po => po.status !== 'fully invoiced')
    .map(po => `<option value="${po.poNumber}">${po.poNumber} - ${po.vendor} (Bal: ${formatCurrency(po.totalValue - po.invoicedValue)})</option>`)
    .join('');
  DOM.modalPoSelect.innerHTML = `<option value="non-po">None (Non-PO Case)</option>${poOptions}`;

  // Populate COA Dropdown
  DOM.modalCoaSelect.innerHTML = STATE.coaAccounts
    .map(coa => `<option value="${coa.code}">${coa.code} - ${coa.name}</option>`)
    .join('');

  DOM.invoiceModalOverlay.classList.add('active');
});

function hideModal() {
  DOM.invoiceModalOverlay.classList.remove('active');
}
DOM.closeInvoiceModalBtn.addEventListener('click', hideModal);
DOM.cancelInvoiceModalBtn.addEventListener('click', hideModal);

// Log Submission
DOM.invoiceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const invId = document.getElementById('modal-inv-id').value;
  const vendorName = document.getElementById('modal-vendor').value;
  const amountVal = parseFloat(document.getElementById('modal-amount').value);
  const poRef = DOM.modalPoSelect.value;
  const coaCode = DOM.modalCoaSelect.value;
  const processor = document.getElementById('modal-processor').value;

  // Process rules
  let matchStatus = 'pass';
  let status = 'approved';
  let companyCode = 'IM-01';

  // If tied to PO, perform matching
  if (poRef !== 'non-po') {
    const po = STATE.purchaseOrders.find(p => p.poNumber === poRef);
    if (po) {
      companyCode = po.companyCode || 'IM-01';
      const balance = po.totalValue - po.invoicedValue;

      if (amountVal > balance) {
        matchStatus = 'fail';
        status = 'duplicate hold';
        showToast(`Warning: Invoice amount (PKR ${amountVal.toLocaleString('en-PK')}) exceeds remaining PO limit of PKR ${balance.toLocaleString('en-PK')}. Invoice placed on match-discrepancy hold.`, 'warning');
      } else {
        po.invoicedValue += amountVal;
        if (po.invoicedValue >= po.totalValue) {
          po.status = 'fully invoiced';
        } else {
          po.status = 'partially invoiced';
        }
        showToast(`Invoice matched to PO ${poRef} successfully.`);
      }
    }
  } else {
    // Non-PO cases default to Pending Manager approval and bypass 3-way match
    matchStatus = 'na';
    status = 'pending approval';
    
    // In Non-PO form, default to the selected global company code or IM-01
    const globalCompany = document.getElementById('global-company-filter').value;
    companyCode = globalCompany === 'all' ? 'IM-01' : globalCompany;
    showToast(`Non-PO Invoice logged and sent to Manager Approval queue.`);
  }

  // Update COA allocation totals
  const coa = STATE.coaAccounts.find(c => c.code === coaCode);
  if (coa) {
    coa.spend += amountVal;
  }

  // Append entry to Daily Log with today's date
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  STATE.dailyLog.unshift({
    date: todayStr,
    timestamp: timeStr,
    invoiceId: invId,
    vendor: vendorName,
    amount: amountVal,
    poRef: poRef === 'non-po' ? 'Non-PO' : poRef,
    processor: processor,
    matchStatus: matchStatus,
    status: status,
    companyCode: companyCode
  });

  saveState();
  hideModal();
  refreshAll();
});


/* =========================================================================
   4. DASHBOARD 4: EXECUTIVE SUMMARY REPORT
   ========================================================================= */

function updateCoaDashboard() {
  const { coas } = getFilteredData();
  const filterVal = DOM.coaGroupFilter.value;

  // Metrics calculations
  let totalAllocated = 0;
  let activeCodes = coas.length;
  let budgetPass = 0;
  let budgetFail = 0;

  coas.forEach(coa => {
    totalAllocated += coa.spend;
    if (coa.spend > coa.budget) {
      budgetFail++;
    } else {
      budgetPass++;
    }
  });

  DOM.coaKpiSpend.textContent = formatCurrency(totalAllocated);
  DOM.coaKpiCount.textContent = activeCodes;
  DOM.coaKpiBudgetPass.textContent = budgetPass;
  DOM.coaKpiBudgetFail.textContent = budgetFail;

  // Filter COA accounts by category
  const filteredCoas = coas.filter(coa => {
    return filterVal === 'all' || coa.category === filterVal;
  });

  // Render Table rows
  DOM.coaTableBody.innerHTML = filteredCoas.map(coa => {
    const remaining = coa.budget - coa.spend;
    const utilization = coa.budget > 0 ? (coa.spend / coa.budget) * 100 : 0;
    
    let statusClass = 'on-track';
    let statusText = 'On Track';
    if (coa.spend > coa.budget) {
      statusClass = 'critical';
      statusText = 'Over Budget';
    }

    return `
      <tr>
        <td class="coa-bold-text">${coa.code}</td>
        <td>${coa.name}</td>
        <td class="hide-mobile" style="text-transform: capitalize; color: var(--text-muted); font-size: 0.8rem;">${coa.category}</td>
        <td class="coa-bold-text">${formatCurrency(coa.spend)}</td>
        <td class="hide-mobile">${formatCurrency(coa.budget)}</td>
        <td class="hide-mobile" style="color: ${remaining >= 0 ? 'var(--text-secondary)' : 'var(--accent-danger)'}; font-weight: 500;">
          ${remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
        </td>
        <td class="hide-mobile">
          <div class="progress-bar-wrapper">
            <div class="progress-track" style="background-color: var(--border-color);">
              <div class="progress-fill" style="width: ${Math.min(utilization, 100)}%; background: ${utilization > 100 ? 'var(--accent-danger)' : 'linear-gradient(90deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)'}"></div>
            </div>
            <span class="progress-percentage" style="color: ${utilization > 100 ? 'var(--accent-danger)' : 'var(--text-secondary)'}">${Math.round(utilization)}%</span>
          </div>
        </td>
        <td>
          <span class="budget-status-tag ${statusClass}">${statusText}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Bind COA filter controls
DOM.coaGroupFilter.addEventListener('change', updateCoaDashboard);
if (DOM.coaDateFrom) DOM.coaDateFrom.addEventListener('change', updateCoaDashboard);
if (DOM.coaDateTo) DOM.coaDateTo.addEventListener('change', updateCoaDashboard);



/* =========================================================================
   5. CHART.JS VISUAL DATA RENDER ENGINE
   ========================================================================= */

function renderCharts() {
  const colors = getThemeColors();
  const { pos, logs, coas } = getFilteredData();
  
  // Set global Chart.js configuration overrides
  Chart.defaults.color = colors.text;
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.font.size = 11;

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { color: colors.grid },
        ticks: { color: colors.text }
      },
      y: {
        grid: { color: colors.grid },
        ticks: { color: colors.text }
      }
    }
  };

  // Helper to safely replace chart instances
  function setupChart(chartName, config) {
    if (activeCharts[chartName]) {
      activeCharts[chartName].destroy();
    }
    const ctx = document.getElementById(chartName);
    if (ctx) {
      activeCharts[chartName] = new Chart(ctx, config);
    }
  }

  // A. OPEN PO REPORT CHARTS
  if (STATE.activeTab === 'page-open-po') {
    // Calculate aging brackets based on 2026-06-03 base date
    let brackets = [0, 0, 0, 0]; // 0-30, 31-60, 61-90, 90+
    const baseDate = new Date('2026-06-03');
    pos.forEach(po => {
      const poDate = new Date(po.date);
      const diffTime = Math.abs(baseDate - poDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remaining = po.totalValue - po.invoicedValue;
      if (diffDays <= 30) {
        brackets[0] += remaining;
      } else if (diffDays <= 60) {
        brackets[1] += remaining;
      } else if (diffDays <= 90) {
        brackets[2] += remaining;
      } else {
        brackets[3] += remaining;
      }
    });

    // A1. Aging Bar Chart
    setupChart('po-aging-chart', {
      type: 'bar',
      data: {
        labels: ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
        datasets: [{
          data: brackets,
          backgroundColor: [colors.primary, colors.secondary, colors.purple, colors.warning],
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptionsBase,
        scales: {
          ...chartOptionsBase.scales,
          y: {
            ...chartOptionsBase.scales.y,
            ticks: {
              callback: (val) => 'PKR ' + (val / 1000) + 'k'
            }
          }
        }
      }
    });

    // Calculate vendor commitments allocation
    const vendorCommitments = {};
    pos.forEach(po => {
      const remaining = po.totalValue - po.invoicedValue;
      vendorCommitments[po.vendor] = (vendorCommitments[po.vendor] || 0) + remaining;
    });
    
    const sortedVendors = Object.entries(vendorCommitments)
      .sort((a, b) => b[1] - a[1]);
    
    const topLabels = [];
    const topValues = [];
    let othersSum = 0;
    
    sortedVendors.forEach(([vendor, val], idx) => {
      if (idx < 4) {
        topLabels.push(vendor.length > 12 ? vendor.substring(0, 12) + '...' : vendor);
        topValues.push(val);
      } else {
        othersSum += val;
      }
    });
    
    if (sortedVendors.length > 4 && othersSum > 0) {
      topLabels.push('Others');
      topValues.push(othersSum);
    }

    // A2. Vendor Commitment pie/donut
    setupChart('po-vendor-chart', {
      type: 'doughnut',
      data: {
        labels: topLabels.length > 0 ? topLabels : ['No Commitments'],
        datasets: [{
          data: topValues.length > 0 ? topValues : [0],
          backgroundColor: [colors.secondary, colors.primary, colors.purple, colors.warning, '#475569'],
          borderWidth: 2,
          borderColor: colors.cardBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: colors.text, boxWidth: 12 }
          }
        }
      }
    });
  }



  // C. DAILY LOG CHARTS
  if (STATE.activeTab === 'page-daily-log') {
    const processorCounts = {};
    logs.forEach(l => {
      processorCounts[l.processor] = (processorCounts[l.processor] || 0) + 1;
    });

    const analysts = Object.keys(processorCounts);
    const analystCounts = Object.values(processorCounts);

    // C1. Workload horizontal bar chart
    setupChart('processor-workload-chart', {
      type: 'bar',
      data: {
        labels: analysts.length > 0 ? analysts : ['No Workload'],
        datasets: [{
          data: analystCounts.length > 0 ? analystCounts : [0],
          backgroundColor: colors.purple,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        ...chartOptionsBase,
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: { stepSize: 1, color: colors.text }
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.text }
          }
        }
      }
    });
  }

  // D. COA PROCESSING REPORT CHARTS
  if (STATE.activeTab === 'page-coa-wise') {
    const codes = coas.map(c => c.code);
    const spends = coas.map(c => c.spend);
    const budgets = coas.map(c => c.budget);

    // D1. Expense distribution
    setupChart('coa-expense-chart', {
      type: 'doughnut',
      data: {
        labels: coas.map(c => `${c.code} - ${c.name.split(' ')[0]}`),
        datasets: [{
          data: spends.length > 0 ? spends : [0],
          backgroundColor: [
            colors.primary, 
            colors.secondary, 
            colors.purple, 
            colors.warning, 
            colors.danger, 
            '#0f766e', 
            '#4338ca', 
            '#701a75'
          ],
          borderWidth: 2,
          borderColor: colors.cardBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: colors.text, boxWidth: 10 }
          }
        }
      }
    });

    // D2. Budget vs Actual Comparison
    setupChart('coa-budget-chart', {
      type: 'bar',
      data: {
        labels: codes,
        datasets: [
          {
            label: 'Actual Spend',
            data: spends,
            backgroundColor: spends.map((s, idx) => s > budgets[idx] ? colors.danger : colors.primary),
            borderRadius: 4
          },
          {
            label: 'Budget Limit',
            data: budgets,
            backgroundColor: '#475569',
            borderRadius: 4
          }
        ]
      },
      options: {
        ...chartOptionsBase,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: colors.text }
          }
        },
        scales: {
          ...chartOptionsBase.scales,
          y: {
            ...chartOptionsBase.scales.y,
            ticks: {
              callback: (val) => 'PKR ' + (val / 1000) + 'k'
            }
          }
        }
      }
    });
  }
}


/* =========================================================================
   6. GLOBAL INITIALISATION
   ========================================================================= */

function init() {
  updateOpenPoDashboard();

  updateDailyLogDashboard();
  updateCoaDashboard();
  renderCharts();
  
  // Set current date in header
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  DOM.date = document.getElementById('header-date');
  if (DOM.date) {
    DOM.date.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// Start core setups
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', renderCharts);


/* =========================================================================
   FEATURE A: LOCALSTORAGE PERSISTENCE
   ========================================================================= */

function saveState() {
  try {
    localStorage.setItem('imarat-ap-data', JSON.stringify({
      purchaseOrders:       STATE.purchaseOrders,
      dailyLog:             STATE.dailyLog,
      nonPoQueue:           STATE.nonPoQueue,
      coaAccounts:          STATE.coaAccounts,
      poComplianceCount:    STATE.poComplianceCount,
      nonPoComplianceCount: STATE.nonPoComplianceCount
    }));
  } catch(e) { console.warn('Save failed:', e); }
}

window.resetToDefaults = function() {
  if (!confirm('⚠️ Reset ALL data to factory defaults? This will erase every entry you have added.')) return;
  localStorage.removeItem('imarat-ap-data');
  location.reload();
};


/* =========================================================================
   FEATURE B: CSV EXPORT / IMPORT / TEMPLATE DOWNLOAD
   ========================================================================= */

function downloadBlob(content, filename) {
  const BOM  = '\uFEFF'; // UTF-8 BOM so Excel opens it correctly
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function toCSVString(data, headers) {
  const escape = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [headers.join(','), ...data.map(row => headers.map(h => escape(row[h])).join(','))].join('\r\n');
}

window.exportCSV = function(type) {
  const today = new Date().toISOString().split('T')[0];
  const cfg = {
    po:  { h: ['poNumber','vendor','date','deliveryDate','totalValue','invoicedValue','status'],
           d: STATE.purchaseOrders,  f: `Imarat_PO_Report_${today}.csv` },
    log: { h: ['date','timestamp','invoiceId','vendor','amount','poRef','processor','matchStatus','status'],
           d: STATE.dailyLog,        f: `Imarat_Daily_Log_${today}.csv` },
    coa: { h: ['code','name','category','spend','budget'],
           d: STATE.coaAccounts,     f: `Imarat_COA_Report_${today}.csv` },
    npo: { h: ['id','vendor','amount','date','defaultCoa'],
           d: STATE.nonPoQueue,      f: `Imarat_NonPO_Queue_${today}.csv` }
  };
  const c = cfg[type]; if (!c) return;
  downloadBlob(toCSVString(c.d, c.h), c.f);
  showToast(`✅ Exported ${c.d.length} records → ${c.f}`);
};

window.downloadTemplate = function(type) {
  const tpl = {
    po:  { h: ['poNumber','vendor','date','deliveryDate','totalValue','invoicedValue','status'],
           s: ['PO-2026-0055','Your Vendor Ltd','2026-06-04','2026-07-15','500000','0','open'],
           f: 'Template_PurchaseOrders.csv' },
    log: { h: ['date','timestamp','invoiceId','vendor','amount','poRef','processor','matchStatus','status'],
           s: ['2026-06-04','09:00 AM','INV-00001','Vendor Name','75000','PO-2026-0042','Finance Executive 1','pass','approved'],
           f: 'Template_DailyLog.csv' },
    coa: { h: ['code','name','category','spend','budget'],
           s: ['6800','New Expense Account','indirect','0','100000'],
           f: 'Template_COA.csv' },
    npo: { h: ['id','vendor','amount','date','defaultCoa'],
           s: ['NPO-00100','Utility Provider','8000','2026-06-04','6200'],
           f: 'Template_NonPO_Queue.csv' }
  };
  const t = tpl[type]; if (!t) return;
  downloadBlob([t.h.join(','), t.s.join(',')].join('\r\n'), t.f);
  showToast(`📄 Template downloaded: ${t.f}`);
};

function parseCSVText(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const vals = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/^"|"$/g, ''); });
    return obj;
  }).filter(r => Object.values(r).some(v => v));
}

window.importFromCSV = function(file, type) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const rows = parseCSVText(e.target.result);
    if (!rows.length) { showToast('No valid data found in CSV.', 'error'); return; }
    let ok = 0, skip = 0;
    if (type === 'po') {
      rows.forEach(r => {
        if (!r.poNumber || !r.vendor) { skip++; return; }
        r.totalValue = parseFloat(r.totalValue) || 0;
        r.invoicedValue = parseFloat(r.invoicedValue) || 0;
        if (STATE.purchaseOrders.find(p => p.poNumber === r.poNumber)) { skip++; return; }
        STATE.purchaseOrders.push(r); ok++;
      });
    } else if (type === 'log') {
      rows.forEach(r => {
        if (!r.invoiceId || !r.vendor) { skip++; return; }
        r.amount = parseFloat(r.amount) || 0;
        if (!r.date) r.date = new Date().toISOString().split('T')[0];
        if (STATE.dailyLog.find(l => l.invoiceId === r.invoiceId)) { skip++; return; }
        STATE.dailyLog.unshift(r); ok++;
      });
    } else if (type === 'coa') {
      rows.forEach(r => {
        if (!r.code || !r.name) { skip++; return; }
        r.spend = parseFloat(r.spend) || 0; r.budget = parseFloat(r.budget) || 0;
        if (STATE.coaAccounts.find(c => c.code === r.code)) { skip++; return; }
        STATE.coaAccounts.push(r); ok++;
      });
    } else if (type === 'npo') {
      rows.forEach(r => {
        if (!r.id || !r.vendor) { skip++; return; }
        r.amount = parseFloat(r.amount) || 0;
        if (STATE.nonPoQueue.find(n => n.id === r.id)) { skip++; return; }
        STATE.nonPoQueue.push(r); ok++;
      });
    }
    saveState(); refreshAll();
    document.getElementById('import-modal-overlay').classList.remove('active');
    showToast(`✅ Imported ${ok} records. ${skip ? skip + ' skipped (duplicates/invalid).' : ''}`);
  };
  reader.readAsText(file);
};


/* =========================================================================
   FEATURE C: ADD NEW PURCHASE ORDER MODAL
   ========================================================================= */

document.getElementById('open-add-po-modal-btn').addEventListener('click', () => {
  document.getElementById('add-po-form').reset();
  document.getElementById('apo-date').value     = new Date().toISOString().split('T')[0];
  document.getElementById('add-po-modal-overlay').classList.add('active');
  feather.replace();
});

['close-add-po-modal-btn','cancel-add-po-btn'].forEach(id =>
  document.getElementById(id).addEventListener('click', () =>
    document.getElementById('add-po-modal-overlay').classList.remove('active')));

document.getElementById('add-po-form').addEventListener('submit', e => {
  e.preventDefault();
  const poNumber     = document.getElementById('apo-number').value.trim();
  const vendor       = document.getElementById('apo-vendor').value.trim();
  const date         = document.getElementById('apo-date').value;
  const deliveryDate = document.getElementById('apo-delivery').value;
  const totalValue   = parseFloat(document.getElementById('apo-value').value);
  const status       = document.getElementById('apo-status').value;
  const companyCode  = document.getElementById('apo-company').value;
  if (STATE.purchaseOrders.find(p => p.poNumber === poNumber)) {
    showToast(`PO ${poNumber} already exists.`, 'warning'); return;
  }
  STATE.purchaseOrders.unshift({ poNumber, vendor, date, deliveryDate, totalValue, invoicedValue: 0, status, companyCode });
  saveState(); refreshAll();
  document.getElementById('add-po-modal-overlay').classList.remove('active');
  showToast(`✅ PO ${poNumber} — ${vendor} added successfully!`);
});





/* =========================================================================
   FEATURE E: IMPORT CSV MODAL
   ========================================================================= */

document.querySelectorAll('[data-open-import]').forEach(btn =>
  btn.addEventListener('click', () => {
    document.getElementById('import-type-select').value = btn.getAttribute('data-open-import');
    document.getElementById('import-file-input').value  = '';
    document.getElementById('import-modal-overlay').classList.add('active');
    feather.replace();
  }));

['close-import-modal-btn','cancel-import-btn'].forEach(id =>
  document.getElementById(id).addEventListener('click', () =>
    document.getElementById('import-modal-overlay').classList.remove('active')));

document.getElementById('confirm-import-btn').addEventListener('click', () => {
  const type = document.getElementById('import-type-select').value;
  const file = document.getElementById('import-file-input').files[0];
  if (!file) { showToast('Please select a CSV file first.', 'warning'); return; }
  importFromCSV(file, type);
});

document.getElementById('dl-template-btn').addEventListener('click', () => {
  downloadTemplate(document.getElementById('import-type-select').value);
});




/* =========================================================================
   FEATURE F: REFRESH ALL DASHBOARDS HELPER
   ========================================================================= */

function refreshAll() {
  updateOpenPoDashboard();

  updateDailyLogDashboard();
  updateCoaDashboard();
  renderCharts();
  feather.replace();
}


/* =========================================================================
   FEATURE G: GOOGLE SHEETS LIVE SYNC
   Uses JSONP so it works from both local file:// and hosted web servers.
   ========================================================================= */

// ── Settings modal open/close ──────────────────────────────────────────────
document.getElementById('sheet-settings-btn').addEventListener('click', () => {
  openSettingsModal();
});

['close-settings-modal-btn', 'cancel-settings-btn'].forEach(id =>
  document.getElementById(id).addEventListener('click', () =>
    document.getElementById('settings-modal-overlay').classList.remove('active')));

function openSettingsModal() {
  // Pre-fill saved URL if exists, or show default URL as placeholder
  const savedUrl = localStorage.getItem('imarat-sheets-url') || '';
  const input = document.getElementById('sheets-url-input');
  input.value = savedUrl;
  if (!savedUrl && CONFIG.defaultSheetsUrl) {
    input.placeholder = CONFIG.defaultSheetsUrl + " (Using Default)";
  } else {
    input.placeholder = "https://script.google.com/macros/s/YOUR_ID_HERE/exec";
  }
  
  const savedAuto = localStorage.getItem('imarat-sheets-auto');
  document.getElementById('auto-sync-toggle').checked =
    savedAuto !== null ? savedAuto === 'true' : CONFIG.autoSyncDefault;
    
  document.getElementById('connection-status').style.display = 'none';
  document.getElementById('settings-modal-overlay').classList.add('active');
  feather.replace();
}

// ── Shared save logic ─────────────────────────────────────────────────────
function doSaveAndSync() {
  const url = document.getElementById('sheets-url-input').value.trim();
  if (!url) { showToast('Please enter your Google Apps Script Web App URL.', 'warning'); return; }
  if (!url.includes('script.google.com')) {
    showToast('That does not look like a valid Apps Script URL.', 'warning'); return;
  }
  localStorage.setItem('imarat-sheets-url', url);
  localStorage.setItem('imarat-sheets-auto', document.getElementById('auto-sync-toggle').checked);
  document.getElementById('settings-modal-overlay').classList.remove('active');
  syncFromGoogleSheets();
}

// ── Save & Sync Now button (footer) ───────────────────────────────────────
document.getElementById('save-sync-btn').addEventListener('click', doSaveAndSync);

// ── Save & Sync Now button (inline, next to Test Connection) ──────────────
document.getElementById('save-sync-btn-inline').addEventListener('click', doSaveAndSync);

// ── Test Connection button ─────────────────────────────────────────────────
document.getElementById('test-connection-btn').addEventListener('click', () => {
  const url = document.getElementById('sheets-url-input').value.trim();
  if (!url) { showToast('Enter a URL first.', 'warning'); return; }
  const status = document.getElementById('connection-status');
  status.style.display = 'block';
  status.style.background = 'rgba(var(--accent-secondary-rgb),0.08)';
  status.style.border = '1px solid rgba(var(--accent-secondary-rgb),0.2)';
  status.style.color = 'var(--text-secondary)';
  status.textContent = '⏳ Testing connection... please wait';

  callSheetsAPI(url, (data) => {
    const poCount  = (data?.purchaseOrders || []).length;
    const logCount = (data?.dailyLog       || []).length;
    if (data && (poCount > 0 || logCount > 0)) {
      status.style.background = 'rgba(var(--accent-primary-rgb),0.1)';
      status.style.border     = '1px solid rgba(var(--accent-primary-rgb),0.25)';
      status.style.color      = 'var(--accent-primary)';
      status.textContent = `✅ Connected! Found ${poCount} POs and ${logCount} log entries. Now click "Save & Sync Now" →`;
    } else {
      status.style.background = 'rgba(var(--accent-warning-rgb),0.1)';
      status.style.border     = '1px solid rgba(var(--accent-warning-rgb),0.25)';
      status.style.color      = 'var(--accent-warning)';
      status.textContent = '⚠️ Connected but sheet looks empty. Make sure tabs are named: PO_Report, Daily_Log, NonPO_Queue, COA_Accounts';
    }
  }, () => {
    status.style.background = 'rgba(var(--accent-danger-rgb),0.1)';
    status.style.border     = '1px solid rgba(var(--accent-danger-rgb),0.25)';
    status.style.color      = 'var(--accent-danger)';
    status.textContent = '❌ Connection failed. Make sure "Who has access" is set to Anyone (not just Google users).';
  });
});



// ── Sync Sheets header button ──────────────────────────────────────────────
document.getElementById('sync-sheets-btn').addEventListener('click', () => {
  const url = getSheetsUrl();
  if (!url) {
    showToast('No Google Sheet connected yet. Click the ⚙️ Settings button first.', 'warning');
    openSettingsModal();
    return;
  }
  syncFromGoogleSheets();
});

// ── Core JSONP Fetch ───────────────────────────────────────────────────────
function callSheetsAPI(url, onSuccess, onError) {
  const cbName  = '__gsSync_' + Date.now();
  const fullUrl = url + (url.includes('?') ? '&' : '?') + 'callback=' + cbName;

  const timer = setTimeout(() => {
    cleanup();
    if (onError) onError('timeout');
  }, 20000);

  function cleanup() {
    clearTimeout(timer);
    delete window[cbName];
    const s = document.getElementById('__gs_script__');
    if (s) s.remove();
  }

  window[cbName] = (data) => {
    cleanup();
    onSuccess(data);
  };

  const script   = document.createElement('script');
  script.id      = '__gs_script__';
  script.src     = fullUrl;
  script.onerror = () => { cleanup(); if (onError) onError('network'); };
  document.head.appendChild(script);
}

// ── Main Sync Function ─────────────────────────────────────────────────────
function syncFromGoogleSheets() {
  const url = getSheetsUrl();
  if (!url) return;

  // Animate the sync button
  const btn     = document.getElementById('sync-sheets-btn');
  const btnIcon = btn.querySelector('svg') || btn.querySelector('i');
  btn.disabled  = true;
  if (btnIcon) btnIcon.style.animation = 'spin 1s linear infinite';

  showToast('🔄 Syncing from Google Sheets...');

  callSheetsAPI(url, (data) => {
    // Restore button
    btn.disabled = false;
    if (btnIcon) btnIcon.style.animation = '';

    let updated = 0;

    if (data.purchaseOrders?.length) {
      STATE.purchaseOrders = data.purchaseOrders.map((r, idx) => ({
        ...r,
        totalValue:    parseFloat(r.totalValue)    || 0,
        invoicedValue: parseFloat(r.invoicedValue) || 0,
        companyCode:   r.companyCode || (['IM-01', 'IM-02', 'IM-03'][idx % 3])
      }));
      updated++;
    }
    if (data.dailyLog?.length) {
      STATE.dailyLog = data.dailyLog.map((r, idx) => ({
        ...r,
        amount: parseFloat(r.amount) || 0,
        status: (r.status || 'approved').toLowerCase().trim(),
        matchStatus: (r.matchStatus || 'na').toLowerCase().trim(),
        companyCode: r.companyCode || (['IM-01', 'IM-02', 'IM-03'][idx % 3])
      }));
      updated++;
    }
    if (Array.isArray(data.nonPoQueue)) {
      STATE.nonPoQueue = data.nonPoQueue.map((r, idx) => ({
        ...r,
        amount: parseFloat(r.amount) || 0,
        companyCode: r.companyCode || (['IM-01', 'IM-02', 'IM-03'][idx % 3])
      }));
      updated++;
    }
    if (data.coaAccounts?.length) {
      STATE.coaAccounts = data.coaAccounts.map((r, idx) => ({
        ...r,
        spend:  parseFloat(r.spend)  || 0,
        budget: parseFloat(r.budget) || 0,
        companyCode: r.companyCode || (['IM-01', 'IM-02', 'IM-03'][idx % 3])
      }));
      updated++;
    }

    if (updated === 0) {
      showToast('⚠️ Connected but no data returned. Check your Sheet tab names.', 'warning');
      return;
    }

    saveState();
    refreshAll();
    showToast(`✅ Synced! ${STATE.dailyLog.length} log entries, ${STATE.purchaseOrders.length} POs loaded.`);

    // Store last sync timestamp
    localStorage.setItem('imarat-last-sync', new Date().toLocaleString('en-PK'));

  }, (err) => {
    btn.disabled = false;
    if (btnIcon) btnIcon.style.animation = '';
    showToast('❌ Sync failed. Check your Apps Script URL in Settings (⚙️).', 'error');
    console.error('Sheets sync error:', err);
  });
}

// ── Auto-sync on page load if enabled ─────────────────────────────────────
(function autoSyncOnLoad() {
  const shouldAutoSync = isAutoSyncEnabled();
  const url            = getSheetsUrl();
  if (shouldAutoSync && url) {
    // Small delay so the UI renders first
    setTimeout(syncFromGoogleSheets, 1500);
  }
})();

// ── Spin animation keyframe (injected once) ────────────────────────────────
(function injectSpinStyle() {
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
})();

