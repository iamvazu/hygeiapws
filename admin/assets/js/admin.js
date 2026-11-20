/**
 * HYGEIA ENTERPRISE — MASTER OPERATIONS COMMAND CENTER ENGINE (v4.0.0)
 * Multi-Enterprise Real-Time Pipeline for Montero Enterprises Inc.
 * Synchronizes PWS & Janitorial Inbound Leads, Work Orders & Fleet Routing.
 */

(function() {
  'use strict';

  // API Base Resolver
  const API_BASE = (function() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.port === '5000' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return window.location.origin + '/api';
      }
      return window.location.origin + '/api';
    }
    return '/api';
  })();

  const ADMIN_TOKEN_KEY = 'hygeia_admin_token';
  let leadsData = [];
  let workOrdersData = [];
  let clientsData = [];
  let metricsData = null;
  let activeModalLeadId = null;
  let activeModalClientId = null;
  let activeModalWorkOrderId = null;

  // Filter States for Unified Leads
  let filterUnit = 'all';     // 'all' | 'pws' | 'janitorial'
  let filterStatus = 'all';   // 'all' | 'new' | 'quoted' | 'dispatched' | 'completed'
  let searchQuery = '';

  // Filter States for Work Orders
  let filterWoUnit = 'all';
  let filterWoStatus = 'all';
  let searchWoQuery = '';

  // Filter States for Clients
  let filterClientUnit = 'all';
  let searchClientQuery = '';

  // Auth Helpers
  function getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }
  function setAdminToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
  function clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  // Toast System
  function showToast(message, isError = false) {
    const toast = document.getElementById('adminToast');
    const msg = document.getElementById('adminToastMsg');
    if (!toast || !msg) return;

    msg.textContent = message;
    toast.style.display = 'flex';
    toast.style.borderLeftColor = isError ? '#EF4444' : 'var(--admin-gold)';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3500);
  }
  window.showToast = showToast;

  // View Switcher Function (Exposed to window)
  window.switchEnterpriseView = function(viewName) {
    if (!viewName) viewName = 'combined';
    
    // Normalize viewName
    if (viewName === 'overview') viewName = 'combined';

    const containers = {
      combined: document.getElementById('view-combined'),
      pws: document.getElementById('view-pws'),
      janitorial: document.getElementById('view-janitorial')
    };

    const buttons = {
      combined: document.getElementById('btnNavCombined'),
      pws: document.getElementById('btnNavPWS'),
      janitorial: document.getElementById('btnNavJanitorial')
    };

    Object.keys(containers).forEach(k => {
      if (containers[k]) {
        if (k === viewName) {
          containers[k].classList.add('active');
        } else {
          containers[k].classList.remove('active');
        }
      }
    });

    Object.keys(buttons).forEach(k => {
      if (buttons[k]) {
        if (k === viewName) {
          buttons[k].classList.add('active');
        } else {
          buttons[k].classList.remove('active');
        }
      }
    });

    try {
      window.history.replaceState(null, null, '#' + viewName);
    } catch (e) {}

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-render data for current view
    renderUnifiedLeadsTable();
    renderPwsLeadsTable();
    renderJanitorialLeadsTable();
    renderAllWorkOrdersTables();
    renderAllClientsTables();
  };

  // Auth Protection & Login
  function checkAdminAuth() {
    const token = getAdminToken();
    const modal = document.getElementById('adminAuthModal');
    if (!token) {
      if (modal) modal.classList.add('open');
      return false;
    }
    if (modal) modal.classList.remove('open');
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

  const formAdminLogin = document.getElementById('formAdminLogin');
  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value.trim();
      const password = document.getElementById('adminPassword').value;
      const submitBtn = formAdminLogin.querySelector('button[type="submit"]');
      const errBox = document.getElementById('adminAuthError');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      if (errBox) errBox.style.display = 'none';

      try {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed.');

        setAdminToken(data.token);
        const modal = document.getElementById('adminAuthModal');
        if (modal) modal.classList.remove('open');
        showToast('Welcome back, Andy Montero! Command Center active.');
        await fetchLiveMetrics();
        await fetchLiveLeads();
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Enter Command Center';
      }
    });
  }

  const btnAdminLogout = document.getElementById('btnAdminLogout');
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      clearAdminToken();
      const modal = document.getElementById('adminAuthModal');
      if (modal) modal.classList.add('open');
      showToast('Signed out of Operations Hub.');
    });
  }

  // Fetch Live Metrics
  async function fetchLiveMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        metricsData = await res.json();
        workOrdersData = metricsData.workOrders || [];
        clientsData = metricsData.clients || [];
        updateKPICards();
        renderAllWorkOrdersTables();
        renderAllClientsTables();
      }
    } catch (err) {
      console.warn('Metrics sync notice:', err);
    }
  }
  window.fetchLiveMetrics = fetchLiveMetrics;

  function updateKPICards() {
    if (!metricsData) return;

    // Combined KPIs
    const u = metricsData.unified || {};
    const kpiRev = document.getElementById('kpiCombinedRevenue');
    if (kpiRev && u.totalRevenue) {
      kpiRev.innerHTML = `$${Math.round(u.totalRevenue).toLocaleString('en-US')} <span class="kpi-sub-unit">/ mo</span>`;
    }

    const kpiClients = document.getElementById('kpiCombinedClients');
    if (kpiClients && u.activeContractsCount) {
      kpiClients.innerHTML = `${u.activeContractsCount} <span class="kpi-sub-unit">Total</span>`;
    }

    const kpiOpenBadge = document.getElementById('kpiOpenLeadsBadge');
    if (kpiOpenBadge && u.openLeadsCount !== undefined) {
      kpiOpenBadge.textContent = `${u.openLeadsCount} Open Leads · ${metricsData.leads?.length || 0} Total in DB`;
    }

    // PWS KPIs
    const p = metricsData.pws || {};
    const kpiMRR = document.getElementById('kpiMRR');
    if (kpiMRR && p.monthlyRecurringRevenue) {
      kpiMRR.textContent = `$${Math.round(p.monthlyRecurringRevenue).toLocaleString('en-US')}`;
    }

    // Janitorial KPIs
    const j = metricsData.janitorial || {};
    const kpiJanPending = document.getElementById('kpiJanPendingWalks');
    if (kpiJanPending && j.openWalkthroughs !== undefined) {
      kpiJanPending.innerHTML = `${j.openWalkthroughs} <span class="kpi-sub-unit">Walks</span>`;
    }
  }

  // Fetch Live Leads from SQLite DB
  async function fetchLiveLeads(isManualRefresh = false) {
    try {
      const res = await fetch(`${API_BASE}/leads`);
      if (res.ok) {
        const data = await res.json();
        leadsData = data.leads || [];
        updateLeadCounters();
        renderUnifiedLeadsTable();
        renderPwsLeadsTable();
        renderJanitorialLeadsTable();
        if (isManualRefresh) {
          showToast(`Pipeline refreshed: ${leadsData.length} records loaded.`);
        }
      }
    } catch (err) {
      console.warn('Leads fetch error:', err);
    }
  }
  window.fetchLiveLeads = fetchLiveLeads;

  function updateLeadCounters() {
    const countAll = document.getElementById('countAllLeads');
    const countPws = document.getElementById('countPwsLeads');
    const countJan = document.getElementById('countJanLeads');

    const pwsCount = leadsData.filter(l => l.business_unit === 'pws').length;
    const janCount = leadsData.filter(l => l.business_unit === 'janitorial').length;

    if (countAll) countAll.textContent = leadsData.length;
    if (countPws) countPws.textContent = pwsCount;
    if (countJan) countJan.textContent = janCount;
  }

  // Filter Handlers
  window.setLeadFilterUnit = function(unit, btn) {
    filterUnit = unit;
    const parent = btn.closest('.filter-pills-group');
    if (parent) {
      parent.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderUnifiedLeadsTable();
  };

  window.setLeadFilterStatus = function(status, btn) {
    filterStatus = status;
    const parent = btn.closest('.filter-pills-group');
    if (parent) {
      parent.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderUnifiedLeadsTable();
  };

  const searchInput = document.getElementById('unifiedSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderUnifiedLeadsTable();
    });
  }

  // Render Unified Leads Table
  function renderUnifiedLeadsTable() {
    const tbody = document.getElementById('unifiedLeadsTableBody');
    if (!tbody) return;

    let filtered = leadsData.slice();

    // Unit filter
    if (filterUnit !== 'all') {
      filtered = filtered.filter(l => l.business_unit === filterUnit);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(l => {
        return (
          (l.customer_name && l.customer_name.toLowerCase().includes(searchQuery)) ||
          (l.company_name && l.company_name.toLowerCase().includes(searchQuery)) ||
          (l.service_type && l.service_type.toLowerCase().includes(searchQuery)) ||
          (l.city && l.city.toLowerCase().includes(searchQuery)) ||
          (l.phone && l.phone.toLowerCase().includes(searchQuery)) ||
          (l.email && l.email.toLowerCase().includes(searchQuery))
        );
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:40px 20px;color:#94A3B8;">
            <div style="font-size:32px;margin-bottom:8px;">🔍</div>
            <div style="font-weight:700;color:#64748B;">No matching leads or RFPs found.</div>
            <div style="font-size:12.5px;margin-top:4px;">Submissions from contact forms on hygeiapws.com and hygeiaservices.com will stream directly here.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(l => {
      const isPWS = l.business_unit === 'pws';
      const divisionBadge = isPWS
        ? `<span class="badge-pws"><i class="fa-solid fa-truck"></i> PWS</span>`
        : `<span class="badge-janitorial"><i class="fa-solid fa-building"></i> JANITORIAL</span>`;

      const estVal = l.estimated_value 
        ? `$${Number(l.estimated_value).toLocaleString('en-US')}` 
        : (isPWS ? '$450' : '$3,800');

      const dateStr = l.created_at ? l.created_at.split(' ')[0] : 'Today';

      return `
        <tr>
          <td>
            <strong style="font-family:'JetBrains Mono',monospace;color:#0F172A;font-size:12.5px;">#L-${l.id}</strong>
            <div style="font-size:11px;color:#94A3B8;margin-top:2px;">${dateStr}</div>
          </td>
          <td>${divisionBadge}</td>
          <td>
            <div style="font-weight:700;color:#0A2533;font-size:14px;">${escapeHtml(l.customer_name)}</div>
            <div style="font-size:12px;color:#64748B;">${escapeHtml(l.company_name || 'Individual / Residential')}</div>
          </td>
          <td>
            <div style="font-weight:600;color:#1E293B;">${escapeHtml(l.service_type)}</div>
            <div style="font-size:12px;color:#64748B;">${escapeHtml(l.square_footage || l.frequency || l.city || 'Bay Area')}</div>
          </td>
          <td>
            <a href="tel:${escapeHtml(l.phone)}" style="color:#0090FF;text-decoration:none;font-size:12.5px;font-weight:600;display:block;">
              <i class="fa-solid fa-phone" style="font-size:10px;"></i> ${escapeHtml(l.phone || 'No Phone')}
            </a>
            <a href="mailto:${escapeHtml(l.email)}" style="color:#64748B;text-decoration:none;font-size:11.5px;display:block;margin-top:1px;">
              <i class="fa-solid fa-envelope" style="font-size:10px;"></i> ${escapeHtml(l.email)}
            </a>
          </td>
          <td>
            <span style="font-family:'Outfit',sans-serif;font-weight:800;color:#0A2533;font-size:14px;">${estVal}</span>
          </td>
          <td>
            <select class="lead-status-dropdown lead-status-${l.status || 'new'}" onchange="updateLeadStatus(${l.id}, this.value, this)">
              <option value="new" ${l.status === 'new' ? 'selected' : ''}>New Inquiry</option>
              <option value="quoted" ${l.status === 'quoted' ? 'selected' : ''}>Quoted / Walk</option>
              <option value="dispatched" ${l.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex;gap:6px;">
              <button class="btn-table-action" onclick="openLeadDetails(${l.id})" title="Inspect Scope & Notes">
                <i class="fa-regular fa-eye"></i> Scope
              </button>
              <button class="btn-table-action btn-table-delete" onclick="deleteLead(${l.id})" title="Delete Lead">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Dedicated PWS Leads Table
  function renderPwsLeadsTable() {
    const tbody = document.getElementById('pwsLeadsTableBody');
    if (!tbody) return;

    const pwsLeads = leadsData.filter(l => l.business_unit === 'pws');

    if (pwsLeads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94A3B8;">No PWS quote requests found. Submissions from hygeiapws.com will appear here.</td></tr>`;
      return;
    }

    tbody.innerHTML = pwsLeads.map(l => {
      return `
        <tr>
          <td><strong style="font-family:'JetBrains Mono',monospace;">#PWS-${l.id}</strong></td>
          <td>
            <strong>${escapeHtml(l.customer_name)}</strong>
            <div style="font-size:12px;color:#64748B;">${escapeHtml(l.company_name || 'Residential Client')}</div>
          </td>
          <td>${escapeHtml(l.service_type)}</td>
          <td>${escapeHtml(l.city || 'Bay Area')}</td>
          <td>
            <a href="tel:${escapeHtml(l.phone)}" style="color:#0090FF;text-decoration:none;font-weight:600;">${escapeHtml(l.phone || 'N/A')}</a>
          </td>
          <td>
            <select class="lead-status-dropdown lead-status-${l.status || 'new'}" onchange="updateLeadStatus(${l.id}, this.value, this)">
              <option value="new" ${l.status === 'new' ? 'selected' : ''}>New Inquiry</option>
              <option value="quoted" ${l.status === 'quoted' ? 'selected' : ''}>Quoted</option>
              <option value="dispatched" ${l.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td style="text-align:right;">
            <button class="btn-table-action" onclick="openLeadDetails(${l.id})">Scope</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Dedicated Janitorial Leads Table
  function renderJanitorialLeadsTable() {
    const tbody = document.getElementById('janitorialLeadsTableBody');
    if (!tbody) return;

    const janLeads = leadsData.filter(l => l.business_unit === 'janitorial');

    if (janLeads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#94A3B8;">No Commercial Janitorial RFPs found. Submissions from hygeiaservices.com will appear here.</td></tr>`;
      return;
    }

    tbody.innerHTML = janLeads.map(l => {
      return `
        <tr>
          <td><strong style="font-family:'JetBrains Mono',monospace;">#JS-${l.id}</strong></td>
          <td>
            <strong>${escapeHtml(l.customer_name)}</strong>
            <div style="font-size:12px;color:#059669;font-weight:600;">${escapeHtml(l.company_name || 'Commercial Facility')}</div>
          </td>
          <td>${escapeHtml(l.service_type)}</td>
          <td>${escapeHtml(l.square_footage || 'Custom Scope')}</td>
          <td>
            <a href="tel:${escapeHtml(l.phone)}" style="color:#059669;text-decoration:none;font-weight:600;">${escapeHtml(l.phone || 'N/A')}</a>
          </td>
          <td>
            <select class="lead-status-dropdown lead-status-${l.status || 'new'}" onchange="updateLeadStatus(${l.id}, this.value, this)">
              <option value="new" ${l.status === 'new' ? 'selected' : ''}>New Inquiry</option>
              <option value="quoted" ${l.status === 'quoted' ? 'selected' : ''}>Site Walk</option>
              <option value="dispatched" ${l.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>Active Contract</option>
            </select>
          </td>
          <td style="text-align:right;">
            <button class="btn-table-action" onclick="openLeadDetails(${l.id})">Scope</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Update Status Endpoint
  window.updateLeadStatus = async function(leadId, newStatus, selectEl) {
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const lead = leadsData.find(l => l.id === leadId);
        if (lead) lead.status = newStatus;
        if (selectEl) {
          selectEl.className = `lead-status-dropdown lead-status-${newStatus}`;
        }
        showToast(`Lead #L-${leadId} status set to: ${newStatus.toUpperCase()}`);
        await fetchLiveMetrics();
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      showToast('Failed to update lead status: ' + err.message, true);
    }
  };

  // Delete Lead Endpoint
  window.deleteLead = async function(leadId) {
    if (!confirm(`Are you sure you want to delete lead #L-${leadId}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        leadsData = leadsData.filter(l => l.id !== leadId);
        updateLeadCounters();
        renderUnifiedLeadsTable();
        renderPwsLeadsTable();
        renderJanitorialLeadsTable();
        showToast(`Lead #L-${leadId} deleted from database.`);
        await fetchLiveMetrics();
      } else {
        throw new Error('Delete request failed.');
      }
    } catch (err) {
      showToast('Failed to delete lead: ' + err.message, true);
    }
  };

  // Inspect Scope Modal
  window.openLeadDetails = function(leadId) {
    const lead = leadsData.find(l => l.id === leadId);
    if (!lead) return;
    activeModalLeadId = leadId;

    const modal = document.getElementById('leadDetailsModal');
    const badge = document.getElementById('modalLeadBadge');
    const isPWS = lead.business_unit === 'pws';

    if (badge) {
      badge.innerHTML = isPWS
        ? '<span class="badge-pws"><i class="fa-solid fa-truck"></i> PWS</span>'
        : '<span class="badge-janitorial"><i class="fa-solid fa-building"></i> JANITORIAL</span>';
    }

    document.getElementById('modalLeadId').textContent = `Lead #L-${lead.id}`;
    document.getElementById('modalLeadName').textContent = lead.customer_name || 'N/A';
    document.getElementById('modalLeadCompany').textContent = lead.company_name || 'Individual / Residential';
    document.getElementById('modalLeadCity').textContent = lead.city || 'Bay Area';
    document.getElementById('modalLeadAddress').textContent = lead.address || 'Address not specified';
    
    const phoneEl = document.getElementById('modalLeadPhone');
    phoneEl.innerHTML = lead.phone ? `<a href="tel:${lead.phone}" style="color:#0090FF;font-weight:700;">${lead.phone}</a>` : 'Not provided';

    const emailEl = document.getElementById('modalLeadEmail');
    emailEl.innerHTML = lead.email ? `<a href="mailto:${lead.email}" style="color:#0090FF;">${lead.email}</a>` : 'Not provided';

    document.getElementById('modalLeadService').textContent = lead.service_type || 'General Service';
    document.getElementById('modalLeadFreq').textContent = lead.frequency || 'Standard';
    document.getElementById('modalLeadSqft').textContent = lead.square_footage || 'N/A';
    document.getElementById('modalLeadValue').textContent = lead.estimated_value ? `$${lead.estimated_value}` : 'Pending Quote';
    document.getElementById('modalLeadNotes').textContent = lead.notes || 'No special requirements or notes provided with this inquiry.';

    const callBtn = document.getElementById('modalCallBtn');
    if (callBtn) callBtn.href = lead.phone ? `tel:${lead.phone}` : '#';

    const mailBtn = document.getElementById('modalEmailBtn');
    if (mailBtn) mailBtn.href = lead.email ? `mailto:${lead.email}` : '#';

    if (modal) modal.classList.add('open');
  };

  window.deleteCurrentModalLead = function() {
    if (activeModalLeadId) {
      window.deleteLead(activeModalLeadId);
      closeModal('leadDetailsModal');
    }
  };

  // Log New Manual Lead Modal
  window.openNewLeadModal = function(defaultUnit = 'pws') {
    const modal = document.getElementById('newLeadModal');
    const form = document.getElementById('formNewLead');
    if (form) form.reset();

    const radios = document.getElementsByName('lead_business_unit');
    radios.forEach(r => {
      if (r.value === defaultUnit) r.checked = true;
    });

    if (modal) modal.classList.add('open');
  };

  window.handleManualLeadSubmit = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitNewLead');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';

    const radios = document.getElementsByName('lead_business_unit');
    let unit = 'pws';
    radios.forEach(r => { if (r.checked) unit = r.value; });

    const payload = {
      business_unit: unit,
      customer_name: document.getElementById('nl_name').value.trim(),
      company_name: document.getElementById('nl_company').value.trim(),
      email: document.getElementById('nl_email').value.trim(),
      phone: document.getElementById('nl_phone').value.trim(),
      service_type: document.getElementById('nl_service').value.trim(),
      city: document.getElementById('nl_city').value.trim(),
      square_footage: document.getElementById('nl_sqft').value.trim(),
      estimated_value: parseFloat(document.getElementById('nl_value').value) || (unit === 'pws' ? 450 : 3800),
      notes: document.getElementById('nl_notes').value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save lead.');

      showToast(`Lead #${data.leadId || 'NEW'} recorded successfully!`);
      closeModal('newLeadModal');
      await fetchLiveLeads();
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error saving lead: ' + err.message, true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  };

  // Provision New Client Modal
  window.openNewClientModal = function(defaultUnit = 'janitorial') {
    const modal = document.getElementById('newClientModal');
    const form = document.getElementById('formNewClient');
    if (form) form.reset();

    const radios = document.getElementsByName('client_business_unit');
    radios.forEach(r => {
      if (r.value === defaultUnit) r.checked = true;
    });

    updateClientModalDefaults(defaultUnit);
    if (modal) modal.classList.add('open');
  };

  window.updateClientModalDefaults = function(unit) {
    const planInput = document.getElementById('nc_plan');
    const rateInput = document.getElementById('nc_rate');
    const dateInput = document.getElementById('nc_service_date');
    if (!planInput || !rateInput || !dateInput) return;

    if (unit === 'pws') {
      planInput.value = 'Commercial Bin & Walkway Pro ($249/mo)';
      rateInput.value = 249;
      dateInput.value = 'Tomorrow, 7:30 AM (Rig-01)';
    } else {
      planInput.value = 'Medical Terminal Sanitization & Day Porter ($4,200/mo)';
      rateInput.value = 4200;
      dateInput.value = 'Tonight, 9:00 PM (Team Alpha)';
    }
  };

  window.handleCreateClientSubmit = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitNewClient');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Provisioning Client...';

    const radios = document.getElementsByName('client_business_unit');
    let unit = 'janitorial';
    radios.forEach(r => { if (r.checked) unit = r.value; });

    const payload = {
      business_unit: unit,
      name: document.getElementById('nc_name').value.trim(),
      company_name: document.getElementById('nc_company').value.trim(),
      email: document.getElementById('nc_email').value.trim(),
      password: document.getElementById('nc_password').value.trim() || 'Hygeia2026!',
      phone: document.getElementById('nc_phone').value.trim(),
      facility_address: document.getElementById('nc_address').value.trim(),
      city: document.getElementById('nc_city').value.trim() || 'Silicon Valley',
      active_plan: document.getElementById('nc_plan').value.trim(),
      monthly_rate: parseFloat(document.getElementById('nc_rate').value) || 0,
      next_service_date: document.getElementById('nc_service_date').value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/admin/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to provision client account.');

      const portalUrl = unit === 'pws' ? 'https://pws.2.25.90.226.sslip.io/portal.html' : 'https://janitorial.2.25.90.226.sslip.io/portal.html';
      showToast(`🎉 Account ${data.customer_id} created for ${payload.name}! Client can log in at ${portalUrl}`);
      closeModal('newClientModal');
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error provisioning client: ' + err.message, true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  };

  // Close Modals
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  };

  // =========================================================================
  // WORK ORDERS MANAGEMENT ENGINE
  // =========================================================================

  window.setWorkOrderFilterUnit = function(unit, btn) {
    filterWoUnit = unit;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) parent.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderUnifiedWorkOrdersTable();
  };

  window.setWorkOrderFilterStatus = function(status, btn) {
    filterWoStatus = status;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) parent.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderUnifiedWorkOrdersTable();
  };

  window.handleWorkOrdersSearch = function(query) {
    searchWoQuery = (query || '').toLowerCase().trim();
    renderUnifiedWorkOrdersTable();
  };

  function renderAllWorkOrdersTables() {
    updateWorkOrderCounters();
    renderUnifiedWorkOrdersTable();
    renderPwsWorkOrdersTable();
    renderJanitorialWorkOrdersTable();
  }

  function updateWorkOrderCounters() {
    const countAll = workOrdersData.length;
    const countJan = workOrdersData.filter(w => (w.business_unit || 'janitorial') === 'janitorial').length;
    const countPws = workOrdersData.filter(w => w.business_unit === 'pws').length;
    const pendingOrders = workOrdersData.filter(w => w.status === 'pending_approval');
    const pendingCount = pendingOrders.length;
    const janPending = pendingOrders.filter(w => (w.business_unit || 'janitorial') === 'janitorial').length;

    const elAll = document.getElementById('countAllWorkOrders');
    if (elAll) elAll.textContent = countAll;
    const elJan = document.getElementById('countJanWorkOrders');
    if (elJan) elJan.textContent = countJan;
    const elPws = document.getElementById('countPwsWorkOrders');
    if (elPws) elPws.textContent = countPws;

    const badgePending = document.getElementById('badgePendingWorkOrdersCount');
    if (badgePending) {
      if (pendingCount > 0) {
        badgePending.textContent = `🚨 ${pendingCount} Pending Review`;
        badgePending.style.display = 'inline-flex';
      } else {
        badgePending.style.display = 'none';
      }
    }

    const badgeJanPending = document.getElementById('badgeJanPendingOrders');
    if (badgeJanPending) {
      if (janPending > 0) {
        badgeJanPending.textContent = `🚨 ${janPending} Pending Review`;
        badgeJanPending.style.display = 'inline-flex';
      } else {
        badgeJanPending.style.display = 'none';
      }
    }
  }

  function generateWorkOrderRow(order, showDivision = true) {
    const isPWS = order.business_unit === 'pws';
    const divBadge = isPWS
      ? '<span class="badge-pws" style="font-size:11px;"><i class="fa-solid fa-truck"></i> PWS</span>'
      : '<span class="badge-janitorial" style="font-size:11px;"><i class="fa-solid fa-building"></i> JANITORIAL</span>';

    const urgencyClass = `urgency-badge-${order.urgency || 'standard'}`;
    const urgencyIcon = order.urgency === 'rush' || order.urgency === 'emergency' ? '<i class="fa-solid fa-bolt"></i> ' : '';

    const priceFormatted = order.price && parseFloat(order.price) > 0
      ? `$${parseFloat(order.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : '<span style="color:#64748B;font-style:italic;">Pending Quote</span>';

    const clientDisplay = order.client_company_name 
      ? `<strong>${escapeHtml(order.client_company_name)}</strong><br><span style="font-size:12px;color:#64748B;">${escapeHtml(order.client_contact_name || order.client_name)}</span>`
      : `<strong>${escapeHtml(order.client_name || 'Client')}</strong>`;

    return `
      <tr class="clickable-row" onclick="openWorkOrderDetailModal(${order.id})">
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#0A2533;">#WO-${order.id}</td>
        ${showDivision ? `<td>${divBadge}</td>` : ''}
        <td>${clientDisplay}</td>
        <td>
          <div style="font-weight:700;color:#0A2533;">${escapeHtml(order.service_name)}</div>
          <div style="font-size:12.5px;color:#475569;margin-top:2px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${escapeHtml(order.scope_description || 'No description provided')}
          </div>
        </td>
        <td style="font-size:12.5px;color:#334155;">${escapeHtml(order.requested_date || 'ASAP')}</td>
        <td><span class="${urgencyClass}">${urgencyIcon}${escapeHtml((order.urgency || 'standard').toUpperCase())}</span></td>
        <td style="font-family:'Outfit',sans-serif;font-weight:700;color:#0A2533;">${priceFormatted}</td>
        <td style="font-size:12.5px;color:#475569;" onclick="event.stopPropagation()">
          <span style="font-weight:600;color:#0A2533;">${escapeHtml(order.crew_assigned || 'Unassigned')}</span>
        </td>
        <td onclick="event.stopPropagation()">
          <select class="wo-status-dropdown wo-status-${order.status}" onchange="handleWorkOrderStatusChange(${order.id}, this.value, this)">
            <option value="pending_approval" ${order.status === 'pending_approval' ? 'selected' : ''}>⏳ Pending Review</option>
            <option value="approved" ${order.status === 'approved' ? 'selected' : ''}>✅ Approved</option>
            <option value="dispatched" ${order.status === 'dispatched' ? 'selected' : ''}>🚚 Dispatched</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>🏆 Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
          </select>
        </td>
        <td style="text-align:right;" onclick="event.stopPropagation()">
          <div style="display:inline-flex;gap:4px;">
            <button class="btn-table-action" onclick="openWorkOrderDetailModal(${order.id})" title="Dispatch & Update Order">
              <i class="fa-solid fa-pen-to-square"></i> Dispatch
            </button>
            <button class="btn-table-action btn-table-delete" onclick="handleDeleteWorkOrderDirect(${order.id})" title="Delete Order">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderUnifiedWorkOrdersTable() {
    const tbody = document.getElementById('unifiedWorkOrdersTableBody');
    if (!tbody) return;

    let filtered = workOrdersData.slice();

    if (filterWoUnit !== 'all') {
      filtered = filtered.filter(w => (w.business_unit || 'janitorial') === filterWoUnit);
    }
    if (filterWoStatus !== 'all') {
      filtered = filtered.filter(w => w.status === filterWoStatus);
    }
    if (searchWoQuery) {
      filtered = filtered.filter(w => 
        (w.service_name || '').toLowerCase().includes(searchWoQuery) ||
        (w.scope_description || '').toLowerCase().includes(searchWoQuery) ||
        (w.client_name || '').toLowerCase().includes(searchWoQuery) ||
        (w.client_company_name || '').toLowerCase().includes(searchWoQuery) ||
        `#wo-${w.id}`.toLowerCase().includes(searchWoQuery)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-clipboard-check" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No client work orders match your current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => generateWorkOrderRow(order, true)).join('');
  }

  function renderPwsWorkOrdersTable() {
    const tbody = document.getElementById('pwsWorkOrdersTableBody');
    if (!tbody) return;

    const filtered = workOrdersData.filter(w => w.business_unit === 'pws');
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-truck-droplet" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No extra service work orders in the Power Wash dispatch queue.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => generateWorkOrderRow(order, false)).join('');
  }

  function renderJanitorialWorkOrdersTable() {
    const tbody = document.getElementById('janitorialWorkOrdersTableBody');
    if (!tbody) return;

    const filtered = workOrdersData.filter(w => (w.business_unit || 'janitorial') === 'janitorial');
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-building-circle-check" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No active special service requests in the Janitorial dispatch queue.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => generateWorkOrderRow(order, false)).join('');
  }

  // =========================================================================
  // REGISTERED CLIENT ACCOUNTS DIRECTORY ENGINE
  // =========================================================================

  window.setClientFilterUnit = function(unit, btn) {
    filterClientUnit = unit;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) parent.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderUnifiedClientsTable();
  };

  window.handleClientSearch = function(query) {
    searchClientQuery = (query || '').toLowerCase().trim();
    renderUnifiedClientsTable();
  };

  function renderAllClientsTables() {
    updateClientCounters();
    renderUnifiedClientsTable();
    renderPwsClientsTable();
    renderJanitorialClientsTable();
  }

  function updateClientCounters() {
    const countAll = clientsData.length;
    const countJan = clientsData.filter(c => (c.business_unit || 'janitorial') === 'janitorial').length;
    const countPws = clientsData.filter(c => c.business_unit === 'pws').length;

    const elAll = document.getElementById('countAllClients');
    if (elAll) elAll.textContent = countAll;
    const elJan = document.getElementById('countJanClients');
    if (elJan) elJan.textContent = countJan;
    const elPws = document.getElementById('countPwsClients');
    if (elPws) elPws.textContent = countPws;

    const badgeClients = document.getElementById('badgeClientsCount');
    if (badgeClients) {
      badgeClients.textContent = `${countAll} Active Client Accounts`;
    }
  }

  function generateClientRow(c, showDivision = true) {
    const isPWS = c.business_unit === 'pws';
    const divBadge = isPWS
      ? '<span class="badge-pws" style="font-size:11px;"><i class="fa-solid fa-truck"></i> PWS</span>'
      : '<span class="badge-janitorial" style="font-size:11px;"><i class="fa-solid fa-building"></i> JANITORIAL</span>';

    const statusBadge = `<span class="client-status-badge client-status-${c.status || 'active'}"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> ${(c.status || 'active').toUpperCase()}</span>`;

    const clientDisplay = c.company_name 
      ? `<strong>${escapeHtml(c.company_name)}</strong><br><span style="font-size:12px;color:#64748B;">${escapeHtml(c.name)}</span>`
      : `<strong>${escapeHtml(c.name)}</strong>`;

    const contactDisplay = `
      <div style="font-size:12.5px;color:#0A2533;font-weight:600;"><a href="mailto:${escapeHtml(c.email)}" style="color:#0090FF;" onclick="event.stopPropagation()">${escapeHtml(c.email)}</a></div>
      <div style="font-size:12px;color:#64748B;">${escapeHtml(c.phone || 'No phone')}</div>
    `;

    const locationDisplay = `
      <div style="font-size:12.5px;color:#334155;">${escapeHtml(c.facility_address || 'Silicon Valley Facility')}</div>
      <div style="font-size:11.5px;color:#64748B;">${escapeHtml(c.city || 'CA')}</div>
    `;

    const planDisplay = `
      <div style="font-size:12.5px;color:#0A2533;font-weight:700;">${escapeHtml(c.active_plan)}</div>
      <div style="font-size:12px;color:#059669;font-weight:700;">$${parseFloat(c.monthly_rate || 0).toLocaleString('en-US')}/mo</div>
    `;

    return `
      <tr class="clickable-row" onclick="openClientDetailModal(${c.id})">
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#0A2533;">${escapeHtml(c.customer_id)}</td>
        ${showDivision ? `<td>${divBadge}</td>` : ''}
        <td>${clientDisplay}</td>
        <td>${contactDisplay}</td>
        <td>${locationDisplay}</td>
        <td>${planDisplay}</td>
        <td style="font-size:12.5px;color:#475569;">${escapeHtml(c.next_service_date || 'Pending Schedule')}</td>
        <td>${statusBadge}</td>
        <td style="text-align:right;" onclick="event.stopPropagation()">
          <div style="display:inline-flex;gap:4px;">
            <button class="btn-table-action" onclick="openClientDetailModal(${c.id})" title="View and Edit Client Profile">
              <i class="fa-solid fa-user-pen"></i> View / Edit
            </button>
            <button class="btn-table-action btn-table-delete" onclick="handleDeleteClientDirect(${c.id})" title="Delete Client Account">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderUnifiedClientsTable() {
    const tbody = document.getElementById('unifiedClientsTableBody');
    if (!tbody) return;

    let filtered = clientsData.slice();

    if (filterClientUnit !== 'all') {
      filtered = filtered.filter(c => (c.business_unit || 'janitorial') === filterClientUnit);
    }
    if (searchClientQuery) {
      filtered = filtered.filter(c => 
        (c.name || '').toLowerCase().includes(searchClientQuery) ||
        (c.company_name || '').toLowerCase().includes(searchClientQuery) ||
        (c.email || '').toLowerCase().includes(searchClientQuery) ||
        (c.customer_id || '').toLowerCase().includes(searchClientQuery) ||
        (c.facility_address || '').toLowerCase().includes(searchClientQuery) ||
        (c.city || '').toLowerCase().includes(searchClientQuery)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-users" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No client accounts match your search filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(c => generateClientRow(c, true)).join('');
  }

  function renderPwsClientsTable() {
    const tbody = document.getElementById('pwsClientsTableBody');
    if (!tbody) return;

    const filtered = clientsData.filter(c => c.business_unit === 'pws');
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-users" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No Power Wash subscribers found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(c => generateClientRow(c, false)).join('');
  }

  function renderJanitorialClientsTable() {
    const tbody = document.getElementById('janitorialClientsTableBody');
    if (!tbody) return;

    const filtered = clientsData.filter(c => (c.business_unit || 'janitorial') === 'janitorial');
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:36px;color:#64748B;">
            <i class="fa-solid fa-users" style="font-size:28px;margin-bottom:8px;color:#CBD5E1;display:block;"></i>
            No Janitorial facility client accounts found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(c => generateClientRow(c, false)).join('');
  }

  // =========================================================================
  // CLIENT DETAIL MODAL & CRUD HANDLERS
  // =========================================================================

  window.openClientDetailModal = async function(clientId) {
    activeModalClientId = clientId;
    const modal = document.getElementById('clientDetailModal');
    if (!modal) return;

    try {
      const res = await fetch(`${API_BASE}/admin/clients/${clientId}`);
      if (!res.ok) throw new Error('Failed to load client details.');
      const data = await res.json();
      const client = data.client;
      const orders = data.workOrders || [];

      document.getElementById('cdmClientId').value = client.id;
      document.getElementById('cdmTitleName').textContent = client.name;
      document.getElementById('cdmCustomerBadge').textContent = client.customer_id;
      
      const isPWS = client.business_unit === 'pws';
      const unitBadge = document.getElementById('cdmUnitBadge');
      if (unitBadge) {
        unitBadge.className = isPWS ? 'badge-pws' : 'badge-janitorial';
        unitBadge.innerHTML = isPWS ? '<i class="fa-solid fa-truck"></i> Power Wash' : '<i class="fa-solid fa-building"></i> Commercial Janitorial';
      }

      document.getElementById('cdmSubtitleCompany').textContent = client.company_name ? `${client.company_name} · ${client.city || 'CA'}` : (client.city || 'Individual Account');

      // Initials
      const initials = (client.name || 'CL').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const avatarEl = document.getElementById('cdmAvatar');
      if (avatarEl) {
        avatarEl.textContent = initials;
        avatarEl.style.background = isPWS ? '#0090FF' : '#059669';
      }

      document.getElementById('cdmName').value = client.name || '';
      document.getElementById('cdmCompany').value = client.company_name || '';
      document.getElementById('cdmEmail').value = client.email || '';
      document.getElementById('cdmPhone').value = client.phone || '';
      document.getElementById('cdmAddress').value = client.facility_address || '';
      document.getElementById('cdmCity').value = client.city || '';
      document.getElementById('cdmBusinessUnit').value = client.business_unit || 'janitorial';
      document.getElementById('cdmRate').value = client.monthly_rate || 0;
      document.getElementById('cdmStatus').value = client.status || 'active';
      document.getElementById('cdmPlan').value = client.active_plan || '';
      document.getElementById('cdmNextDate').value = client.next_service_date || '';
      document.getElementById('cdmPassword').value = '';

      // Populate client's work orders
      const ordersCountEl = document.getElementById('cdmOrdersCount');
      if (ordersCountEl) ordersCountEl.textContent = `${orders.length} Orders Submitted`;

      const ordersBody = document.getElementById('cdmOrdersTableBody');
      if (ordersBody) {
        if (orders.length === 0) {
          ordersBody.innerHTML = `<tr><td colspan="6" style="padding:14px;text-align:center;color:#64748B;">No service work orders submitted by this client yet.</td></tr>`;
        } else {
          ordersBody.innerHTML = orders.map(wo => `
            <tr style="border-bottom:1px solid #F1F5F9;">
              <td style="padding:8px 10px;font-family:'JetBrains Mono',monospace;font-weight:700;">#WO-${wo.id}</td>
              <td style="padding:8px 10px;font-weight:600;color:#0A2533;">${escapeHtml(wo.service_name)}</td>
              <td style="padding:8px 10px;color:#475569;">${escapeHtml(wo.requested_date || '-')}</td>
              <td style="padding:8px 10px;font-weight:700;">${wo.price > 0 ? `$${parseFloat(wo.price).toFixed(2)}` : '$0.00'}</td>
              <td style="padding:8px 10px;">
                <span class="wo-status-dropdown wo-status-${wo.status}" style="display:inline-block;padding:2px 6px;font-size:11px;">
                  ${wo.status.toUpperCase()}
                </span>
              </td>
              <td style="padding:8px 10px;text-align:right;">
                <button type="button" class="btn-table-action" style="padding:3px 7px;font-size:11px;" onclick="closeModal('clientDetailModal'); openWorkOrderDetailModal(${wo.id});">
                  Manage →
                </button>
              </td>
            </tr>
          `).join('');
        }
      }

      modal.classList.add('open');
    } catch (err) {
      showToast('Error loading client profile: ' + err.message, true);
    }
  };

  window.handleClientUpdateSubmit = async function(e) {
    e.preventDefault();
    if (!activeModalClientId) return;

    const btn = document.getElementById('btnSaveClientChanges');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Profile...';

    const payload = {
      name: document.getElementById('cdmName').value.trim(),
      company_name: document.getElementById('cdmCompany').value.trim(),
      email: document.getElementById('cdmEmail').value.trim(),
      phone: document.getElementById('cdmPhone').value.trim(),
      facility_address: document.getElementById('cdmAddress').value.trim(),
      city: document.getElementById('cdmCity').value.trim(),
      business_unit: document.getElementById('cdmBusinessUnit').value,
      monthly_rate: parseFloat(document.getElementById('cdmRate').value) || 0,
      status: document.getElementById('cdmStatus').value,
      active_plan: document.getElementById('cdmPlan').value.trim(),
      next_service_date: document.getElementById('cdmNextDate').value.trim()
    };

    const newPass = document.getElementById('cdmPassword').value.trim();
    if (newPass) payload.password = newPass;

    try {
      const res = await fetch(`${API_BASE}/admin/clients/${activeModalClientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update client account.');

      showToast(`✅ Client profile for ${payload.name} updated successfully!`);
      closeModal('clientDetailModal');
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error updating client: ' + err.message, true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  };

  window.handleDeleteCurrentClient = async function() {
    if (!activeModalClientId) return;
    const name = document.getElementById('cdmName').value;
    if (!confirm(`Are you sure you want to permanently delete the client account for "${name}"? This will remove all their portal access.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/clients/${activeModalClientId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete client request failed.');
      showToast(`Client account deleted from database.`);
      closeModal('clientDetailModal');
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Failed to delete client: ' + err.message, true);
    }
  };

  window.handleDeleteClientDirect = async function(clientId) {
    const client = clientsData.find(c => c.id === clientId);
    const label = client ? `${client.name} (${client.company_name || 'Account'})` : `#${clientId}`;
    if (!confirm(`Are you sure you want to delete client account ${label}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/clients/${clientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete client account.');
      showToast(`Client ${label} deleted from database.`);
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error deleting client: ' + err.message, true);
    }
  };

  // =========================================================================
  // WORK ORDER DETAIL MODAL & CRUD HANDLERS
  // =========================================================================

  window.openWorkOrderDetailModal = async function(orderId) {
    activeModalWorkOrderId = orderId;
    const modal = document.getElementById('workOrderDetailModal');
    if (!modal) return;

    try {
      const res = await fetch(`${API_BASE}/admin/work-orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to load work order.');
      const data = await res.json();
      const order = data.workOrder;

      document.getElementById('wodmOrderId').value = order.id;
      document.getElementById('wodmOrderBadge').textContent = `#WO-${order.id}`;
      document.getElementById('wodmTitleScope').textContent = order.service_name;

      const isPWS = order.business_unit === 'pws';
      const companyOrClient = order.client_company_name || order.client_name || 'Client';
      document.getElementById('wodmSubtitleClient').innerHTML = `
        <strong>${escapeHtml(companyOrClient)}</strong> · 
        <span class="${isPWS ? 'badge-pws' : 'badge-janitorial'}" style="font-size:11px;">
          ${isPWS ? 'Power Wash' : 'Commercial Janitorial'}
        </span>
      `;

      const urgencyPill = document.getElementById('wodmUrgencyPill');
      if (urgencyPill) {
        urgencyPill.className = `urgency-badge-${order.urgency || 'standard'}`;
        urgencyPill.textContent = (order.urgency || 'standard').toUpperCase();
      }

      document.getElementById('wodmClientDescription').textContent = order.scope_description || 'No description provided by client.';
      document.getElementById('wodmContactName').textContent = order.client_contact_name || order.client_name || '-';
      document.getElementById('wodmContactPhone').textContent = order.client_phone || '-';
      document.getElementById('wodmAddress').textContent = order.facility_address || order.client_city || 'Silicon Valley';

      document.getElementById('wodmStatus').value = order.status || 'pending_approval';
      document.getElementById('wodmPrice').value = order.price || 0;
      document.getElementById('wodmCrew').value = order.crew_assigned || '';
      document.getElementById('wodmDate').value = order.requested_date || '';
      document.getElementById('wodmServiceName').value = order.service_name || '';
      document.getElementById('wodmScopeDesc').value = order.scope_description || '';

      modal.classList.add('open');
    } catch (err) {
      showToast('Error loading work order: ' + err.message, true);
    }
  };

  window.handleWorkOrderUpdateSubmit = async function(e) {
    e.preventDefault();
    if (!activeModalWorkOrderId) return;

    const btn = document.getElementById('btnSaveWorkOrder');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Dispatch...';

    const payload = {
      status: document.getElementById('wodmStatus').value,
      price: parseFloat(document.getElementById('wodmPrice').value) || 0,
      crew_assigned: document.getElementById('wodmCrew').value.trim(),
      requested_date: document.getElementById('wodmDate').value.trim(),
      service_name: document.getElementById('wodmServiceName').value.trim(),
      scope_description: document.getElementById('wodmScopeDesc').value.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/admin/work-orders/${activeModalWorkOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update work order.');

      showToast(`✅ Work order #WO-${activeModalWorkOrderId} updated and dispatched successfully!`);
      closeModal('workOrderDetailModal');
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error updating work order: ' + err.message, true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  };

  window.handleWorkOrderStatusChange = async function(orderId, newStatus, selectEl) {
    try {
      const res = await fetch(`${API_BASE}/admin/work-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Status update failed.');

      if (selectEl) {
        selectEl.className = `wo-status-dropdown wo-status-${newStatus}`;
      }
      showToast(`Work Order #WO-${orderId} status set to: ${newStatus.toUpperCase()}`);
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Failed to update work order status: ' + err.message, true);
    }
  };

  window.handleDeleteCurrentWorkOrder = async function() {
    if (!activeModalWorkOrderId) return;
    if (!confirm(`Are you sure you want to permanently delete work order #WO-${activeModalWorkOrderId}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/work-orders/${activeModalWorkOrderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete work order.');

      showToast(`Work order #WO-${activeModalWorkOrderId} deleted from database.`);
      closeModal('workOrderDetailModal');
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error deleting work order: ' + err.message, true);
    }
  };

  window.handleDeleteWorkOrderDirect = async function(orderId) {
    if (!confirm(`Are you sure you want to delete work order #WO-${orderId}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/work-orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete work order.');

      showToast(`Work order #WO-${orderId} deleted.`);
      await fetchLiveMetrics();
    } catch (err) {
      showToast('Error deleting work order: ' + err.message, true);
    }
  };

  // Export Master Leads CSV
  window.exportMasterLeadsCSV = function() {
    if (leadsData.length === 0) {
      alert('No leads available to export.');
      return;
    }

    const headers = ['ID', 'Division', 'Customer Name', 'Company', 'Email', 'Phone', 'Service Type', 'City', 'Square Footage', 'Frequency', 'Est Value', 'Status', 'Date'];
    const rows = leadsData.map(l => [
      l.id,
      l.business_unit,
      `"${(l.customer_name || '').replace(/"/g, '""')}"`,
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      `"${(l.service_type || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.square_footage || '').replace(/"/g, '""')}"`,
      `"${(l.frequency || '').replace(/"/g, '""')}"`,
      l.estimated_value || 0,
      l.status || 'new',
      l.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hygeia-enterprise-leads-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads CSV report exported successfully!');
  };

  // PWS Commercial Bid Calculator
  window.calculateQuote = function() {
    const client = document.getElementById('qClient')?.value || 'Client';
    const type = document.getElementById('qType')?.value || 'garage';
    const size = parseFloat(document.getElementById('qSize')?.value) || 25000;
    const freq = document.getElementById('qFrequency')?.value || 'one_time';
    const hotWater = document.getElementById('qHotWater')?.checked;
    const reclaim = document.getElementById('qReclaim')?.checked;

    let baseRate = 0.08;
    if (type === 'dumpster') baseRate = 0.12;
    if (type === 'sidewalk') baseRate = 0.15;
    if (type === 'facade') baseRate = 0.18;

    let price = size * baseRate;
    if (type === 'dumpster') price = (size > 10 ? size : 2) * 250;

    if (hotWater) price += 150;
    if (reclaim) price += 200;

    if (freq === 'quarterly') price *= 0.85;
    if (freq === 'monthly') price *= 0.75;

    const rounded = Math.round(price);
    const box = document.getElementById('quoteResultBox');
    const priceEl = document.getElementById('quotePrice');
    const detailsEl = document.getElementById('quoteDetails');

    if (priceEl) priceEl.textContent = `$${rounded.toLocaleString('en-US')}`;
    if (detailsEl) detailsEl.textContent = `${client} · ${type.toUpperCase()} (${size.toLocaleString()} sq ft) · ${freq.toUpperCase()}`;
    if (box) box.style.display = 'block';
  };

  window.saveEstimateToLeads = async function() {
    const client = document.getElementById('qClient')?.value || 'Commercial Client';
    const type = document.getElementById('qType')?.value || 'Commercial Facility';
    const size = document.getElementById('qSize')?.value || '25000';
    const priceText = document.getElementById('quotePrice')?.textContent || '$2,000';
    const numPrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 2000;

    const payload = {
      business_unit: 'pws',
      customer_name: client,
      company_name: client,
      email: 'operations@' + client.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      phone: '(650) 933-3823',
      service_type: `Commercial Pressure Washing (${type})`,
      city: 'Silicon Valley',
      square_footage: `${size} sq ft`,
      estimated_value: numPrice,
      notes: 'Generated via Commercial Proposal Instant Estimator'
    };

    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Estimate saved directly to PWS CRM Pipeline!');
        await fetchLiveLeads();
      }
    } catch (e) {
      showToast('Error saving estimate: ' + e.message, true);
    }
  };

  // Utility to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Initial Boot
  document.addEventListener('DOMContentLoaded', async () => {
    // Check hash for initial view
    let initialView = 'combined';
    if (window.location.hash) {
      const h = window.location.hash.replace('#', '').toLowerCase();
      if (['combined', 'pws', 'janitorial'].includes(h)) {
        initialView = h;
      }
    }
    window.switchEnterpriseView(initialView);

    if (checkAdminAuth()) {
      await fetchLiveMetrics();
      await fetchLiveLeads();
    }

    // Auto-poll leads every 15 seconds so new contact submissions reflect live
    setInterval(() => {
      if (getAdminToken()) {
        fetchLiveLeads(false);
      }
    }, 15000);
  });

})();
