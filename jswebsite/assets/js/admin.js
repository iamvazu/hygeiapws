// Hygeia Enterprise Multi-View Admin Operations & Dispatch Command Center Engine (v2.7.0)
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
      id: "HYG-PW-6612",
      business: "Power Washing",
      business_name: "Power Washing",
      badge: "COMMERCIAL POWER WASH",
      type: "Commercial Parking Garage Power Wash",
      name: "David Vance",
      company: "The Alameda Office Park",
      phone: "(408) 555-2231",
      email: "dvance@alamedapark.com",
      address: "882 The Alameda, San Jose, CA",
      details: "45,000 sq ft 3-Deck Garage · Hot Water Degrease + EPA Wastewater Reclaim",
      notes: "Perform on weekend overnight shift to avoid tenant vehicles.",
      status: "Proposal Sent",
      date: "2/27/2026, 4:15 PM",
      timestamp: Date.now() - 259200000
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
    { id: 4, name: "David Vance", address: "882 The Alameda", city: "San Jose", bins: 4, plan: "Monthly ($55)", status: "Completed", cluster: "san_jose" },
    { id: 5, name: "Elena Rostova", address: "20440 Saratoga Rd", city: "Saratoga", bins: 2, plan: "Monthly ($35)", status: "En Route", cluster: "south_bay" },
    { id: 6, name: "Marcus Brody", address: "10300 N De Anza Blvd", city: "Cupertino", bins: 3, plan: "Monthly ($45)", status: "Pending", cluster: "south_bay" },
    { id: 7, name: "Robert Kim", address: "780 Castro St", city: "Mountain View", bins: 2, plan: "Monthly ($35)", status: "Completed", cluster: "peninsula" },
    { id: 8, name: "Karen Appleton", address: "1104 Benton St", city: "Santa Clara", bins: 3, plan: "Monthly ($45)", status: "Pending", cluster: "san_jose" }
  ];

  // Global View Switcher
  window.switchEnterpriseView = function(viewName) {
    // 1. Update Tabs
    const tabs = document.querySelectorAll('.biz-filter-tab');
    tabs.forEach(t => {
      if (t.dataset.view === viewName) {
        t.classList.add('active', 'btn-navy');
        t.classList.remove('btn-outline');
      } else {
        t.classList.remove('active', 'btn-navy');
        t.classList.add('btn-outline');
      }
    });

    // 2. Update View Containers
    const containers = document.querySelectorAll('.enterprise-view-container');
    containers.forEach(c => {
      c.classList.remove('active');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // 3. Update hash
    window.location.hash = viewName;
  };

  function renderLeadsPipeline(searchTerm = "") {
    const combinedContainer = document.getElementById('unifiedLeadsContainerCombined');
    const janitorialContainer = document.getElementById('unifiedLeadsContainerJanitorial');
    
    const allLeads = getUnifiedLeads();
    const query = searchTerm.toLowerCase().trim();

    const renderCard = (lead) => {
      const card = document.createElement('div');
      card.className = "dash-card mb-16";
      const isJanitorial = lead.business === "Janitorial Services";
      card.style.borderLeft = isJanitorial ? "4px solid #10B981" : "4px solid #0090FF";
      
      const badgeStyle = isJanitorial ? "background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;" : "background:#EFF6FF;color:#0090FF;border:1px solid #BFDBFE;";

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="${badgeStyle}font-size:11.5px;font-weight:800;padding:3px 10px;border-radius:12px;">${lead.badge}</span>
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
            <button class="btn btn-xs btn-gold" onclick="alert('⚡ Live Dispatch Notification sent to field operations lead for ${lead.id} (${lead.name})')">⚡ Alert Lead</button>
          </div>
        </div>
      `;
      return card;
    };

    // Render Combined Container
    if (combinedContainer) {
      combinedContainer.innerHTML = "";
      const filtered = allLeads.filter(l => {
        if (!query) return true;
        return (l.name || "").toLowerCase().includes(query) ||
               (l.company || "").toLowerCase().includes(query) ||
               (l.address || "").toLowerCase().includes(query) ||
               (l.business || "").toLowerCase().includes(query);
      });

      if (filtered.length === 0) {
        combinedContainer.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted);">No matching inquiries found.</div>';
      } else {
        filtered.forEach(lead => combinedContainer.appendChild(renderCard(lead)));
      }
    }

    // Render Janitorial-only Container
    if (janitorialContainer) {
      janitorialContainer.innerHTML = "";
      const janitorialLeads = allLeads.filter(l => l.business === "Janitorial Services");
      if (janitorialLeads.length === 0) {
        janitorialContainer.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted);">No commercial janitorial inquiries.</div>';
      } else {
        janitorialLeads.forEach(lead => janitorialContainer.appendChild(renderCard(lead)));
      }
    }
  }

  window.advanceLeadStatus = function(leadId) {
    const stored = JSON.parse(localStorage.getItem('hygeia_unified_leads') || '[]');
    const lead = stored.find(l => l.id === leadId) || seedLeads.find(l => l.id === leadId);
    
    if (lead) {
      const stages = ["New Inquiry", "Walk Scheduled", "Proposal Sent", "Contract Active", "Completed"];
      const currentIdx = stages.indexOf(lead.status);
      const nextStatus = stages[(currentIdx + 1) % stages.length];
      lead.status = nextStatus;
      
      // Save to localStorage
      const existingIdx = stored.findIndex(l => l.id === leadId);
      if (existingIdx >= 0) {
        stored[existingIdx] = lead;
      } else {
        stored.push(lead);
      }
      localStorage.setItem('hygeia_unified_leads', JSON.stringify(stored));
      renderLeadsPipeline(document.getElementById('leadSearchInput')?.value || "");
    }
  };

  function renderRouteTable(filter = "all") {
    const tbody = document.getElementById('routeTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = filter === "all" ? routeStops : routeStops.filter(s => s.cluster === filter);

    filtered.forEach((stop) => {
      const tr = document.createElement('tr');
      const statusClass = stop.status === "Completed" ? "status-chip chip-completed" : (stop.status === "En Route" ? "status-chip chip-enroute" : "status-chip chip-pending");
      
      tr.innerHTML = `
        <td><span class="stop-badge">#${stop.id}</span></td>
        <td><strong>${stop.name}</strong><br><span style="font-size:12px;color:var(--ink-muted);">${stop.address}</span></td>
        <td><span class="city-pill">${stop.city}</span></td>
        <td><span class="bin-count-pill">${stop.bins} Bins</span></td>
        <td><span class="plan-type-pill">${stop.plan}</span></td>
        <td><span class="${statusClass}"><span class="chip-dot"></span> ${stop.status}</span></td>
        <td style="text-align:right;">
          <button class="btn btn-xs btn-outline" onclick="toggleStopStatus(${stop.id})">Toggle Status</button>
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

  window.calculateQuote = function() {
    const client = document.getElementById('qClient')?.value || "Commercial Client";
    const type = document.getElementById('qType')?.value || "garage";
    const size = parseInt(document.getElementById('qSize')?.value || "25000", 10);
    const freq = document.getElementById('qFrequency')?.value || "one_time";

    let rate = 0.08;
    if (type === "dumpster") rate = 250 / (size > 0 ? size : 1);
    else if (type === "sidewalk") rate = 0.15;
    else if (type === "facade") rate = 0.18;

    let total = type === "dumpster" ? 250 * size : size * rate;

    if (freq === "quarterly") total *= 0.85;
    if (freq === "monthly") total *= 0.75;

    const resBox = document.getElementById('quoteResultBox');
    const title = document.getElementById('quoteTitle');
    const details = document.getElementById('quoteDetails');
    const price = document.getElementById('quotePrice');

    if (resBox && title && details && price) {
      title.innerText = `Proposal Estimate for ${client}`;
      details.innerText = `${size.toLocaleString()} sq ft · ${type.toUpperCase()} · ${freq.replace('_', ' ').toUpperCase()} · Hot Water & EPA Reclaim Included`;
      price.innerText = `$${Math.round(total).toLocaleString()}`;
      resBox.style.display = "block";
    }
  };

  window.openNewRFPModal = function() {
    const name = prompt("Enter Client Contact Name:", "Facility Director");
    if (!name) return;
    const company = prompt("Enter Company / Facility Name:", "Silicon Valley Corp");
    const biz = confirm("Is this for Janitorial Services? (Cancel for Power Washing)") ? "Janitorial Services" : "Power Washing";
    const details = prompt("Enter Service Scope / Details:", "5x/week Nightly Clean · 45,000 sq ft");

    const newLead = {
      id: "HYG-" + (biz === "Janitorial Services" ? "JS" : "PW") + "-" + Math.floor(1000 + Math.random() * 9000),
      business: biz,
      badge: biz === "Janitorial Services" ? "JANITORIAL RFP" : "COMMERCIAL PWS",
      type: "Commercial Proposal Intake",
      name: name,
      company: company || "Commercial Property",
      phone: "(650) 933-3823",
      email: "inquiries@hygeiaenterprise.com",
      address: "Silicon Valley, CA",
      details: details || "Custom commercial cleaning scope",
      notes: "Direct lead logged via Admin Command Center.",
      status: "New Inquiry",
      date: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    const stored = JSON.parse(localStorage.getItem('hygeia_unified_leads') || '[]');
    stored.unshift(newLead);
    localStorage.setItem('hygeia_unified_leads', JSON.stringify(stored));
    renderLeadsPipeline();
    alert(`Lead ${newLead.id} created and synced across both enterprises!`);
  };

  window.exportEnterpriseReport = function() {
    alert("Master Enterprise KPI Report (PWS + Janitorial) exported successfully!");
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Route Filter Select
    const filterSelect = document.getElementById('routeFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        renderRouteTable(e.target.value);
      });
    }

    // Lead Search Input
    const searchInput = document.getElementById('leadSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderLeadsPipeline(e.target.value);
      });
    }

    // Business Filter Tabs
    const bizTabs = document.querySelectorAll('.biz-filter-tab');
    bizTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const view = tab.dataset.view;
        if (view) {
          switchEnterpriseView(view);
        }
      });
    });

    // Check URL hash for initial view
    const hash = window.location.hash.replace('#', '');
    if (hash === 'pws' || hash === 'janitorial' || hash === 'combined') {
      switchEnterpriseView(hash);
    } else {
      switchEnterpriseView('combined');
    }

    renderRouteTable();
    renderLeadsPipeline();
  });
})();
