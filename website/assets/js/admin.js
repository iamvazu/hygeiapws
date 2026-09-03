// Hygeia Admin Operations & Route Dispatch JS Engine
(function() {
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

  function renderRouteTable(filter = "all") {
    const tbody = document.getElementById('routeTableBody');
    tbody.innerHTML = "";

    const filtered = filter === "all" ? routeStops : routeStops.filter(s => s.cluster === filter);

    filtered.forEach((stop, idx) => {
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
      renderRouteTable(document.getElementById('routeFilterSelect').value);
    }
  };

  document.getElementById('routeFilterSelect').addEventListener('change', (e) => {
    renderRouteTable(e.target.value);
  });

  // Field Tech Complete Simulator
  document.getElementById('btnSimulateComplete').addEventListener('click', () => {
    alert('✓ Stop #14 marked COMPLETED! High-temperature wash timestamped (99.9% bacteria kill). Customer John Doe automatically received SMS notification with before/after wash proof photo.');
    const firstEnRoute = routeStops.find(s => s.status === "En Route");
    if (firstEnRoute) {
      firstEnRoute.status = "Completed";
      renderRouteTable(document.getElementById('routeFilterSelect').value);
    }
  });

  // CRM Search
  function renderCRM(query = "") {
    const list = document.getElementById('crmList');
    list.innerHTML = "";

    const matches = routeStops.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.city.toLowerCase().includes(query.toLowerCase()));
    
    matches.forEach(s => {
      const div = document.createElement('div');
      div.className = "crm-item";
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:13.5px;color:var(--brand-navy);">${s.name}</strong>
          <span style="font-size:11.5px;font-weight:700;color:var(--brand-gold);">${s.plan}</span>
        </div>
        <div style="font-size:12px;color:var(--ink-secondary);margin-top:2px;">${s.address}, ${s.city}</div>
      `;
      div.addEventListener('click', () => {
        alert(`Customer Profile: ${s.name}\nAddress: ${s.address}, ${s.city}\nActive Plan: ${s.plan}\nBins: ${s.bins}\nStripe Status: Active Auto-Pay`);
      });
      list.appendChild(div);
    });
  }

  document.getElementById('crmSearchInput').addEventListener('input', (e) => {
    renderCRM(e.target.value);
  });

  renderRouteTable();
  renderCRM();
})();
