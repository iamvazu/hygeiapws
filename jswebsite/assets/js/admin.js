// Hygeia Multi-Enterprise Unified Admin Operations & Dispatch Command Center Engine
(function() {
  const seedLeads = [
    {
      id: "HYG-JS-9042",
      business: "Janitorial Services",
      badge: "JANITORIAL RFP",
      type: "Commercial Janitorial Site Walk RFP",
      name: "Marcus Vance",
      company: "Silicon Valley Tech Campus",
      phone: "(650) 555-0182",
      email: "mvance@techcampus.io",
      address: "100 Innovation Way, Sunnyvale, CA",
      details: "35,000 – 75,000 sq ft · Tech Office · 5–7 Days / Week · Add-ons: Floor Care, Window Washing",
      notes: "Requires after-hours security badge orientation and electronic supervisor logs.",
      status: "Walk Scheduled",
      date: "3/2/2026, 9:15 AM",
      timestamp: Date.now() - 3600000
    },
    {
      id: "HYG-PW-8821",
      business: "Power Washing",
      badge: "BIN SUBSCRIPTION",
      type: "Residential Bin Sanitation Plan",
      name: "Sarah Miller",
      company: "Residential",
      phone: "(408) 555-0914",
      email: "smiller@gmail.com",
      address: "185 Loma Alta Ave, Los Gatos, CA",
      details: "2 Trash Bins · Monthly Recurring ($35/mo)",
      notes: "Gate code #4421. Clean green and black bins.",
      status: "Contract Active",
      date: "3/1/2026, 2:30 PM",
      timestamp: Date.now() - 86400000
    },
    {
      id: "HYG-JS-7734",
      business: "Janitorial Services",
      badge: "DAY PORTER RFP",
      type: "Daytime Porter Staffing RFP",
      name: "Elena Rostova",
      company: "Peninsula Healthcare Center",
      phone: "(650) 555-9821",
      email: "erostova@healthpeninsula.com",
      address: "420 University Ave, Palo Alto, CA",
      details: "15,000 – 35,000 sq ft · Medical Clinic · Full-Time Day Porter + Night Clean",
      notes: "Hospital grade EPA List N sanitizers required across all patient suites.",
      status: "Proposal Sent",
      date: "2/28/2026, 11:00 AM",
      timestamp: Date.now() - 172800000
    },
    {
      id: "APP-JS-3321",
      business: "Janitorial Services",
      badge: "CAREERS",
      type: "Employment Application: Floor Care Tech",
      name: "Carlos Mendoza",
      company: "Candidate (San Jose)",
      phone: "(408) 555-4412",
      email: "carlos.m@email.com",
      address: "San Jose, CA",
      details: "Position: Floor Care Specialist · 3–5 Years Experience",
      notes: "Experienced in VCT stripping, 2000 RPM high-speed burnishing, and terrazzo polishing.",
      status: "Interview Set",
      date: "3/2/2026, 8:00 AM",
      timestamp: Date.now() - 7200000
    }
  ];

  function getUnifiedLeads() {
    try {
      const stored = JSON.parse(localStorage.getItem('hygeia_unified_leads') || '[]');
      return [...stored, ...seedLeads];
    } catch (e) {
      return seedLeads;
    }
  }

  const routeStops = [
    { id: 1, name: "John Doe", address: "1420 Willow Glen Way", city: "San Jose", bins: 3, plan: "Monthly ($45)", status: "Completed", cluster: "san_jose" },
    { id: 2, name: "Sarah Miller", address: "185 Loma Alta Ave", city: "Los Gatos", bins: 2, plan: "Monthly ($35)", status: "En Route", cluster: "south_bay" },
    { id: 3, name: "Michael Chen", address: "420 University Ave", city: "Palo Alto", bins: 2, plan: "One-Time ($65)", status: "Pending", cluster: "peninsula" },
    { id: 4, name: "David Vance", address: "1104 Benton St", city: "Santa Clara", bins: 4, plan: "Monthly ($55)", status: "Completed", cluster: "san_jose" },
    { id: 5, name: "Elena Rostova", address: "780 Castro St", city: "Mountain View", bins: 2, plan: "Monthly ($35)", status: "En Route", cluster: "peninsula" },
    { id: 6, name: "Marcus Brody", address: "20440 Saratoga Los Gatos Rd", city: "Saratoga", bins: 3, plan: "Monthly ($45)", status: "Pending", cluster: "south_bay" },
    { id: 7, name: "Karen Appleton", address: "10300 N De Anza Blvd", city: "Cupertino", bins: 2, plan: "Monthly ($35)", status: "Pending", cluster: "south_bay" },
    { id: 8, name: "Robert Kim", address: "555 E El Camino Real", city: "Sunnyvale", bins: 3, plan: "Monthly ($45)", status: "Completed", cluster: "san_jose" }
  ];

  let currentBusinessFilter = "all";

  function renderLeadsPipeline() {
    const leadsContainer = document.getElementById('unifiedLeadsContainer');
    if (!leadsContainer) return;

    const allLeads = getUnifiedLeads();
    const filtered = currentBusinessFilter === "all" ? allLeads : allLeads.filter(l => l.business === currentBusinessFilter);

    leadsContainer.innerHTML = "";

    if (filtered.length === 0) {
      leadsContainer.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted);">No inquiries found in this category.</div>';
      return;
    }

    filtered.forEach(lead => {
      const card = document.createElement('div');
      card.className = "dash-card mb-16";
      card.style.borderLeft = lead.business === "Janitorial Services" ? "4px solid #10B981" : "4px solid #0090FF";
      
      const badgeClass = lead.business === "Janitorial Services" ? "background:#ECFDF5;color:#059669;" : "background:#EFF6FF;color:#0090FF;";

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="${badgeClass}font-size:11.5px;font-weight:800;padding:3px 10px;border-radius:12px;">${lead.badge}</span>
            <strong style="font-family:var(--font-heading);font-size:16px;color:var(--brand-navy);">${lead.name}</strong>
            <span style="font-size:13px;color:var(--ink-secondary);">· ${lead.company}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:var(--ink-muted);">${lead.date}</span>
            <span class="status-pill status-gold">${lead.status}</span>
          </div>
        </div>

        <div style="font-size:13.5px;color:var(--brand-navy);margin-bottom:6px;">
          📍 <strong>${lead.address}</strong>
        </div>

        <div style="font-size:13px;color:var(--ink-secondary);line-height:1.5;background:var(--bg-subtle);padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:12px;">
          <div><strong>Details:</strong> ${lead.details}</div>
          ${lead.notes ? `<div style="margin-top:4px;"><strong>Notes:</strong> <em>"${lead.notes}"</em></div>` : ''}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:13px;">
          <div style="display:flex;gap:16px;color:var(--ink-secondary);">
            <span>📞 <a href="tel:${lead.phone}" style="color:var(--brand-navy);font-weight:700;">${lead.phone}</a></span>
            <span>✉️ <a href="mailto:${lead.email}" style="color:var(--brand-cyan);">${lead.email}</a></span>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-xs btn-outline" onclick="advanceLeadStatus('${lead.id}')">Advance Stage →</button>
            <button class="btn btn-xs btn-gold" onclick="alert('Dispatch Notification sent to field supervisor for lead ${lead.id}')">⚡ Direct Dispatch</button>
          </div>
        </div>
      `;
      leadsContainer.appendChild(card);
    });
  }

  window.advanceLeadStatus = function(leadId) {
    const stored = JSON.parse(localStorage.getItem('hygeia_unified_leads') || '[]');
    const lead = stored.find(l => l.id === leadId);
    if (lead) {
      const stages = ["New Inquiry", "Walk Scheduled", "Proposal Sent", "Contract Active", "Completed"];
      const currentIdx = stages.indexOf(lead.status);
      lead.status = stages[(currentIdx + 1) % stages.length];
      localStorage.setItem('hygeia_unified_leads', JSON.stringify(stored));
      renderLeadsPipeline();
    } else {
      alert(`Status updated for ${leadId} to next operational stage.`);
    }
  };

  function renderRouteTable(filter = "all") {
    const tbody = document.getElementById('routeTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = filter === "all" ? routeStops : routeStops.filter(s => s.cluster === filter);

    filtered.forEach((stop) => {
      const tr = document.createElement('tr');
      const statusClass = stop.status === "Completed" ? "status-active" : (stop.status === "En Route" ? "status-gold" : "status-secure");
      
      tr.innerHTML = `
        <td><strong>#${stop.id}</strong></td>
        <td><strong>${stop.name}</strong><br><span style="font-size:12px;color:var(--ink-muted);">${stop.address}</span></td>
        <td>${stop.city}</td>
        <td><span class="badge-blue">${stop.bins} Bins</span></td>
        <td>${stop.plan}</td>
        <td><span class="status-pill ${statusClass}">${stop.status}</span></td>
        <td>
          <button class="dash-text-btn" onclick="toggleStopStatus(${stop.id})">Toggle Status</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.toggleStopStatus = function(id) {
    const stop = routeStops.find(s => s.id === id);
    if (stop) {
      if (stop.status === "Pending") stop.status = "En Route";
      else if (stop.status === "En Route") stop.status = "Completed";
      else stop.status = "Pending";
      renderRouteTable(document.getElementById('routeFilterSelect')?.value || "all");
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('routeFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        renderRouteTable(e.target.value);
      });
    }

    // Business Filter Tabs
    const bizTabs = document.querySelectorAll('.biz-filter-tab');
    bizTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        bizTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentBusinessFilter = tab.dataset.biz || "all";
        renderLeadsPipeline();
      });
    });

    renderRouteTable();
    renderLeadsPipeline();
  });
})();
