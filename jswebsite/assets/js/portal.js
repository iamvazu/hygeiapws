/**
 * HYGEIA JANITORIAL SERVICES — PRODUCTION CLIENT PORTAL ENGINE (v3.0.0)
 * Real-time JWT Authentication, Live Database Synchronization, Work Orders & Billing
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

  const TOKEN_KEY = 'hygeia_client_token';
  const BUSINESS_UNIT = 'janitorial';

  let currentClient = null;
  let currentWorkOrders = [];
  let currentInvoices = [];

  // DOM Elements
  const authContainer = document.getElementById('authContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  const authErrorBanner = document.getElementById('authErrorBanner');
  const btnSignOut = document.getElementById('btnSignOut');

  // Auth Tabs
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  function showAuthError(msg) {
    if (authErrorBanner) {
      authErrorBanner.textContent = msg;
      authErrorBanner.style.display = 'block';
    }
  }

  function clearAuthError() {
    if (authErrorBanner) {
      authErrorBanner.textContent = '';
      authErrorBanner.style.display = 'none';
    }
  }

  function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function parseResponse(res) {
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText || 'Unable to parse response'}`);
    }
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed (${res.status})`);
    }
    return data;
  }

  // Switch between Login and Register Tabs
  if (tabBtnLogin && tabBtnRegister) {
    tabBtnLogin.addEventListener('click', () => {
      tabBtnLogin.classList.add('active');
      tabBtnRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      clearAuthError();
    });

    tabBtnRegister.addEventListener('click', () => {
      tabBtnRegister.classList.add('active');
      tabBtnLogin.classList.remove('active');
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
      clearAuthError();
    });
  }

  // Quick Demo Credential Autofill
  window.fillDemoCredentials = function(email, password) {
    const emailField = document.getElementById('loginEmail');
    const passField = document.getElementById('loginPassword');
    if (emailField && passField) {
      emailField.value = email;
      passField.value = password;
      clearAuthError();
    }
  };

  // 1. Handle Login Submit
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const submitBtn = formLogin.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await parseResponse(res);

        setAuthToken(data.token);
        currentClient = data.client;
        await initDashboard();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 2. Handle Register Submit
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const submitBtn = formRegister.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

      const payload = {
        name: document.getElementById('regName').value.trim(),
        company_name: document.getElementById('regCompany').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        phone: document.getElementById('regPhone').value.trim(),
        facility_address: document.getElementById('regAddress').value.trim(),
        city: document.getElementById('regCity').value.trim(),
        business_unit: BUSINESS_UNIT,
        active_plan: 'Silicon Valley Commercial Facility Care Program'
      };

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await parseResponse(res);

        setAuthToken(data.token);
        currentClient = data.client;
        await initDashboard();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 3. Sign Out Handler
  if (btnSignOut) {
    btnSignOut.addEventListener('click', () => {
      clearAuthToken();
      currentClient = null;
      if (dashboardContainer) dashboardContainer.style.display = 'none';
      if (authContainer) authContainer.style.display = 'block';
    });
  }

  // 4. Fetch and Render Live Dashboard Data
  async function initDashboard() {
    const token = getAuthToken();
    if (!token) {
      if (dashboardContainer) dashboardContainer.style.display = 'none';
      if (authContainer) authContainer.style.display = 'block';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/portal/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await parseResponse(res);
      currentClient = data.client;
      currentWorkOrders = data.workOrders || [];
      currentInvoices = data.invoices || [];

      renderClientDashboard(data);

      if (authContainer) authContainer.style.display = 'none';
      if (dashboardContainer) dashboardContainer.style.display = 'block';
    } catch (err) {
      console.warn('Dashboard init error:', err.message);
      clearAuthToken();
      if (dashboardContainer) dashboardContainer.style.display = 'none';
      if (authContainer) authContainer.style.display = 'block';
      showAuthError(err.message);
    }
  }

  function renderClientDashboard(data) {
    const { client, invoices, workOrders, stats } = data;

    // Client Headers & Badges
    const elName = document.getElementById('dashClientName');
    const elCompany = document.getElementById('dashCompanyName');
    const elCustId = document.getElementById('dashCustomerId');
    const elInitials = document.getElementById('dashInitials');
    const elAddress = document.getElementById('dashAddress');

    if (elName) elName.textContent = client.name;
    if (elCompany) elCompany.textContent = client.company_name || 'Commercial Facility Client';
    if (elCustId) elCustId.textContent = client.customer_id;
    if (elAddress) elAddress.textContent = `${client.facility_address || 'Facility Address on File'}, ${client.city || 'Bay Area'}`;

    if (elInitials) {
      const parts = client.name.split(' ');
      elInitials.textContent = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : client.name.substring(0, 2).toUpperCase();
    }

    // Stats Cards
    const elNextService = document.getElementById('dashNextService');
    const elActivePlan = document.getElementById('dashActivePlan');
    const elMonthlyRate = document.getElementById('dashMonthlyRate');
    const elOpenOrdersCount = document.getElementById('dashOpenOrdersCount');

    if (elNextService) elNextService.textContent = client.next_service_date || 'Tonight, 9:00 PM';
    if (elActivePlan) elActivePlan.textContent = client.active_plan;
    if (elMonthlyRate) elMonthlyRate.textContent = client.monthly_rate > 0 ? `$${client.monthly_rate.toLocaleString('en-US')}/mo` : 'Custom Contract';
    if (elOpenOrdersCount) elOpenOrdersCount.textContent = `${stats.openWorkOrders} Active`;

    // Render Work Orders Table
    renderWorkOrdersTable(workOrders);

    // Render Invoices Table
    renderInvoicesTable(invoices);

    // Fill Edit Profile Form
    const editName = document.getElementById('editName');
    const editCompany = document.getElementById('editCompany');
    const editPhone = document.getElementById('editPhone');
    const editAddress = document.getElementById('editAddress');
    const editCity = document.getElementById('editCity');

    if (editName) editName.value = client.name || '';
    if (editCompany) editCompany.value = client.company_name || '';
    if (editPhone) editPhone.value = client.phone || '';
    if (editAddress) editAddress.value = client.facility_address || '';
    if (editCity) editCity.value = client.city || '';
  }

  function renderWorkOrdersTable(orders) {
    const tbody = document.getElementById('workOrdersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">
            <i class="fa-solid fa-clipboard-check" style="font-size:24px;margin-bottom:8px;display:block;opacity:0.5;"></i>
            No extra work orders requested yet. Use the button above to request special site services.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      let statusBadge = '';
      if (order.status === 'completed') {
        statusBadge = '<span class="dash-badge badge-green"><i class="fa-solid fa-check"></i> Completed</span>';
      } else if (order.status === 'dispatched') {
        statusBadge = '<span class="dash-badge badge-blue"><i class="fa-solid fa-truck-fast"></i> Dispatched</span>';
      } else if (order.status === 'approved') {
        statusBadge = '<span class="dash-badge badge-gold"><i class="fa-solid fa-thumbs-up"></i> Approved</span>';
      } else {
        statusBadge = '<span class="dash-badge badge-amber"><i class="fa-solid fa-clock"></i> Pending Review</span>';
      }

      let urgencyTag = order.urgency === 'emergency' 
        ? '<span class="urgency-tag urgency-red">🚨 24/7 Emergency</span>'
        : (order.urgency === 'rush' ? '<span class="urgency-tag urgency-orange">⚡ Rush</span>' : '<span class="urgency-tag">Standard</span>');

      return `
        <tr>
          <td><strong style="color:var(--brand-navy);font-family:monospace;">#WO-${order.id}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--brand-navy);">${order.service_name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${order.scope_description || 'Standard facility scope'}</div>
          </td>
          <td>${order.requested_date || 'Next Dispatch'}</td>
          <td>${urgencyTag}</td>
          <td>${order.crew_assigned || '<span style="color:var(--text-muted);">Operations Review</span>'}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;

    if (!invoices || invoices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">
            <i class="fa-solid fa-receipt" style="font-size:24px;margin-bottom:8px;display:block;opacity:0.5;"></i>
            No invoices generated for this billing cycle.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = invoices.map(inv => {
      const isPaid = inv.status === 'paid';
      const badge = isPaid 
        ? '<span class="dash-badge badge-green"><i class="fa-solid fa-check"></i> Paid</span>'
        : '<span class="dash-badge badge-amber"><i class="fa-solid fa-clock"></i> Pending</span>';

      return `
        <tr>
          <td><strong style="font-family:monospace;color:var(--brand-navy);">${inv.invoice_number}</strong></td>
          <td>${inv.issue_date || 'Current Cycle'}</td>
          <td>${inv.due_date || 'Net 15'}</td>
          <td><strong style="color:var(--brand-gold);">$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
          <td>${badge}</td>
        </tr>
      `;
    }).join('');
  }

  // 5. Extra Work Order Submission
  const formWorkOrder = document.getElementById('formWorkOrder');
  const workOrderModal = document.getElementById('workOrderModal');
  const btnOpenWorkOrderModal = document.getElementById('btnOpenWorkOrderModal');
  const btnCloseWorkOrderModal = document.getElementById('btnCloseWorkOrderModal');

  if (btnOpenWorkOrderModal && workOrderModal) {
    btnOpenWorkOrderModal.addEventListener('click', () => {
      workOrderModal.classList.add('open');
    });
  }

  if (btnCloseWorkOrderModal && workOrderModal) {
    btnCloseWorkOrderModal.addEventListener('click', () => {
      workOrderModal.classList.remove('open');
    });
  }

  if (formWorkOrder) {
    formWorkOrder.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getAuthToken();
      if (!token) return alert('Session expired. Please sign in again.');

      const submitBtn = formWorkOrder.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Dispatch...';

      const payload = {
        service_name: document.getElementById('woServiceName').value,
        scope_description: document.getElementById('woScope').value,
        requested_date: document.getElementById('woDate').value,
        urgency: document.getElementById('woUrgency').value,
        price: parseFloat(document.getElementById('woEstimatedPrice').value) || 0
      };

      try {
        const res = await fetch(`${API_BASE}/portal/request-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await parseResponse(res);

        alert('✅ Work Order Submitted Successfully! Hygeia Janitorial Operations has received your request.');
        if (workOrderModal) workOrderModal.classList.remove('open');
        formWorkOrder.reset();
        await initDashboard();
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // 6. Profile & Settings Update
  const formProfileSettings = document.getElementById('formProfileSettings');
  if (formProfileSettings) {
    formProfileSettings.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getAuthToken();
      if (!token) return alert('Session expired.');

      const submitBtn = formProfileSettings.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const payload = {
        name: document.getElementById('editName').value.trim(),
        company_name: document.getElementById('editCompany').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        facility_address: document.getElementById('editAddress').value.trim(),
        city: document.getElementById('editCity').value.trim()
      };

      try {
        const res = await fetch(`${API_BASE}/portal/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await parseResponse(res);

        alert('✅ Facility information and contact details successfully saved to database.');
        await initDashboard();
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  // Auto-init on page load
  document.addEventListener('DOMContentLoaded', initDashboard);
})();
