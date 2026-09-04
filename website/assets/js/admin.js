/**
 * HYGEIA ENTERPRISE — UNIFIED ADMIN COMMAND CENTER ENGINE (v3.0.0)
 * Real-time Multi-View Dashboard for Montero Enterprises Inc.
 * Synchronizes PWS & Janitorial Business Units, Leads, Work Orders & Truck Route Dispatches.
 */

(function() {
  const API_BASE = (function() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
      }
      return 'https://2.25.90.226.sslip.io/api';
    }
    return 'https://2.25.90.226.sslip.io/api';
  })();

  const ADMIN_TOKEN_KEY = 'hygeia_admin_token';

  let currentView = 'unified'; // 'unified' | 'pws' | 'janitorial'
  let leadsData = [];
  let metricsData = null;

  function getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  function setAdminToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  function clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  // --- Auth Modal / Protection ---
  const adminAuthModal = document.getElementById('adminAuthModal');
  const formAdminLogin = document.getElementById('formAdminLogin');
  const adminAuthError = document.getElementById('adminAuthError');
  const btnAdminLogout = document.getElementById('btnAdminLogout');

  function checkAdminAuth() {
    const token = getAdminToken();
    if (!token) {
      if (adminAuthModal) adminAuthModal.classList.add('open');
      return false;
    }
    if (adminAuthModal) adminAuthModal.classList.remove('open');
    return true;
  }

  window.fillAdminDemo = function() {
    const u = document.getElementById('adminUsername');
    const p = document.getElementById('adminPassword');
    if (u && p) {
      u.value = 'admin@hygeia.com';
      p.value = 'HygeiaAdmin2026!';
    }
  };

  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value.trim();
      const password = document.getElementById('adminPassword').value;
      const submitBtn = formAdminLogin.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      if (adminAuthError) adminAuthError.style.display = 'none';

      try {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid administrator credentials.');

        setAdminToken(data.token);
        if (adminAuthModal) adminAuthModal.classList.remove('open');
        await fetchLiveMetrics();
        await fetchLiveLeads();
      } catch (err) {
        if (adminAuthError) {
          adminAuthError.textContent = err.message;
          adminAuthError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Authenticate & Enter Command Center';
      }
    });
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      clearAdminToken();
      if (adminAuthModal) adminAuthModal.classList.add('open');
    });
  }

  // --- View Switcher Tabs ---
  const viewTabs = document.querySelectorAll('.dash-nav-btn');
  viewTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      viewTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderActiveView();
      renderLeads();
    });
  });

  // --- Fetch API Data ---
  async function fetchLiveMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        metricsData = await res.json();
        renderActiveView();
      }
    } catch (err) {
      console.warn('Metrics sync error, using cached data:', err);
    }
  }

  async function fetchLiveLeads() {
    try {
      const res = await fetch(`${API_BASE}/leads`);
      if (res.ok) {
        const data = await res.json();
        leadsData = data.leads || [];
        renderLeads();
      }
    } catch (err) {
      console.warn('Leads sync error:', err);
    }
  }

  function renderActiveView() {
    const kpiGrid = document.getElementById('kpiCardsGrid');
    if (!kpiGrid) return;

    if (!metricsData) return;

    if (currentView === 'unified') {
      const u = metricsData.unified || {};
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Unified Recurring Revenue</div>
          <div class="kpi-value" style="color:var(--brand-gold);">$${(u.totalRevenue || 58000).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div class="kpi-trend trend-up">▲ 18.4% vs last quarter</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Commercial Contracts</div>
          <div class="kpi-value">${u.activeContractsCount || 86} Active</div>
          <div class="kpi-sub">PWS & Janitorial Clients</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Open Lead Pipeline</div>
          <div class="kpi-value" style="color:#38BDF8;">${u.openLeadsCount || leadsData.length} New</div>
          <div class="kpi-sub">Ready for site walk / quote dispatch</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Truck & Crew Route Efficiency</div>
          <div class="kpi-value" style="color:#22C55E;">${u.routeEfficiency || '98%'}</div>
          <div class="kpi-sub">24/7 Peninsula & South Bay Dispatch</div>
        </div>
      `;
    } else if (currentView === 'pws') {
      const p = metricsData.pws || {};
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">PWS Recurring Revenue</div>
          <div class="kpi-value" style="color:#38BDF8;">$${(p.monthlyRecurringRevenue || 5219).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div class="kpi-trend trend-up">▲ 142 Active Curbside Subscriptions</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Fleet & Rig Units</div>
          <div class="kpi-value">Rig-01 & Rig-02</div>
          <div class="kpi-sub">200° Hot Water Custom Reclaim Rigs</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Today's Route Stops</div>
          <div class="kpi-value">${p.stopsCompleted || 1} / ${p.stopsTotal || 4} Completed</div>
          <div class="kpi-sub">Carlos Mendez (Rig-01) En Route</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Stormwater Reclaimed (EPA)</div>
          <div class="kpi-value" style="color:#22C55E;">360 Gal</div>
          <div class="kpi-sub">100% Closed-Loop California Compliant</div>
        </div>
      `;
    } else if (currentView === 'janitorial') {
      const j = metricsData.janitorial || {};
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Janitorial Contract Value</div>
          <div class="kpi-value" style="color:var(--brand-gold);">$${(j.monthlyContractValue || 44200).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div class="kpi-trend trend-up">▲ 18 Managed Silicon Valley Facilities</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Cleaned Square Footage</div>
          <div class="kpi-value">${j.squareFootageMaintained || '485,000 sq ft'}</div>
          <div class="kpi-sub">Tech, Biotech, Medical & Class A</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Day Porter Hours This Week</div>
          <div class="kpi-value" style="color:#38BDF8;">160 Hours</div>
          <div class="kpi-sub">On-site facility maintenance</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Quality Audit Score</div>
          <div class="kpi-value" style="color:#22C55E;">99.4%</div>
          <div class="kpi-sub">Supervised Quality Control Inspections</div>
        </div>
      `;
    }
  }

  function renderLeads() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    let filtered = leadsData;
    if (currentView === 'pws') {
      filtered = leadsData.filter(l => l.business_unit === 'pws');
    } else if (currentView === 'janitorial') {
      filtered = leadsData.filter(l => l.business_unit === 'janitorial');
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94A3B8;">No incoming leads found for this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => {
      const unitBadge = l.business_unit === 'pws' 
        ? '<span class="dash-badge badge-blue">PWS</span>' 
        : '<span class="dash-badge badge-gold">JANITORIAL</span>';

      let statusBadge = '<span class="dash-badge badge-amber">New</span>';
      if (l.status === 'quoted') statusBadge = '<span class="dash-badge badge-blue">Quoted</span>';
      if (l.status === 'dispatched') statusBadge = '<span class="dash-badge badge-gold">Dispatched</span>';
      if (l.status === 'completed') statusBadge = '<span class="dash-badge badge-green">Completed</span>';

      return `
        <tr>
          <td><strong style="color:#F1F5F9;font-family:monospace;">#L-${l.id}</strong></td>
          <td>${unitBadge}</td>
          <td>
            <div style="font-weight:700;color:#F8FAFC;">${l.customer_name}</div>
            <div style="font-size:12px;color:#94A3B8;">${l.company_name || 'Individual / Residential'}</div>
          </td>
          <td>
            <div style="font-weight:600;color:#E2E8F0;">${l.service_type}</div>
            <div style="font-size:12px;color:#64748B;">${l.square_footage || l.frequency || l.city || 'Bay Area'}</div>
          </td>
          <td>
            <a href="tel:${l.phone}" style="color:#38BDF8;text-decoration:none;font-size:12px;display:block;">${l.phone || 'No Phone'}</a>
            <a href="mailto:${l.email}" style="color:#94A3B8;text-decoration:none;font-size:11px;">${l.email}</a>
          </td>
          <td>
            <select class="lead-status-select" onchange="window.updateLeadStatus(${l.id}, this.value)" style="background:#0A2533;color:#F8FAFC;border:1px solid #334155;border-radius:4px;padding:4px 8px;font-size:12px;">
              <option value="new" ${l.status === 'new' ? 'selected' : ''}>New Inquiry</option>
              <option value="quoted" ${l.status === 'quoted' ? 'selected' : ''}>Quoted / Site Walk</option>
              <option value="dispatched" ${l.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Completed / Client</option>
            </select>
          </td>
          <td>
            <button onclick="alert('Lead Details:\\n\\nName: ${l.customer_name}\\nCompany: ${l.company_name || 'N/A'}\\nEmail: ${l.email}\\nPhone: ${l.phone}\\nService: ${l.service_type}\\nCity: ${l.city || 'Bay Area'}\\nNotes: ${l.notes || 'None'}')" style="background:#1E293B;border:1px solid #475569;color:#F8FAFC;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;">
              View Notes
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.updateLeadStatus = async function(leadId, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const lead = leadsData.find(l => l.id === leadId);
        if (lead) lead.status = newStatus;
        await fetchLiveMetrics();
      }
    } catch (err) {
      alert('Failed to update lead status: ' + err.message);
    }
  };

  // Initial Load
  document.addEventListener('DOMContentLoaded', async () => {
    if (checkAdminAuth()) {
      await fetchLiveMetrics();
      await fetchLiveLeads();
    }
  });
})();
