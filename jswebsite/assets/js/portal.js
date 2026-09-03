// Hygeia Client Portal JS Engine
(function() {
  const users = {
    john_sj: {
      name: "John Doe",
      initials: "JD",
      address: "1420 Willow Glen Way, San Jose, CA 95125",
      city: "San Jose",
      bins: 3,
      plan: "monthly",
      price: 45,
      nextWash: "Tuesday, Sept 8",
      card: "Mastercard ending in •••• 4242",
      gateCode: "#4821 - Side gate unlocked on trash days",
      phone: "(408) 555-0192"
    },
    sarah_lg: {
      name: "Sarah Miller",
      initials: "SM",
      address: "185 Loma Alta Ave, Los Gatos, CA 95030",
      city: "Los Gatos",
      bins: 2,
      plan: "monthly",
      price: 35,
      nextWash: "Wednesday, Sept 9",
      card: "Visa ending in •••• 1089",
      gateCode: "Call on arrival; bins at front curb",
      phone: "(650) 555-0814"
    },
    michael_pa: {
      name: "Michael Chen",
      initials: "MC",
      address: "420 University Ave, Palo Alto, CA 94301",
      city: "Palo Alto",
      bins: 2,
      plan: "onetime",
      price: 65,
      nextWash: "Thursday, Sept 10",
      card: "Amex ending in •••• 3004",
      gateCode: "Driveway access code 9920",
      phone: "(650) 555-7281"
    }
  };

  let currentUser = JSON.parse(localStorage.getItem('hygeia_current_user')) || users.john_sj;

  function renderUser() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userInitials').textContent = currentUser.initials;
    document.getElementById('greetingText').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}! 👋`;
    document.getElementById('serviceAddressSub').innerHTML = `Service Address: <strong>${currentUser.address}</strong>`;
    
    document.getElementById('nextWashDate').textContent = currentUser.nextWash;
    document.getElementById('portalBinCount').textContent = currentUser.bins;
    document.getElementById('cardLast4').textContent = currentUser.card;
    document.getElementById('inputGateCode').value = currentUser.gateCode;
    document.getElementById('inputNotifyPhone').value = currentUser.phone;
    
    updatePlanCalculations();
  }

  function updatePlanCalculations() {
    const isMonthly = document.getElementById('radioMonthly').checked;
    const bins = parseInt(document.getElementById('portalBinCount').textContent) || 2;
    
    const monthlyTotal = 35 + Math.max(0, bins - 2) * 10;
    const onetimeTotal = 65 + Math.max(0, bins - 2) * 10;
    
    document.getElementById('calcMonthlyPrice').textContent = `$${monthlyTotal} / month`;
    document.getElementById('calcOnetimePrice').textContent = `$${onetimeTotal} once`;
    
    const finalPrice = isMonthly ? monthlyTotal : onetimeTotal;
    document.getElementById('portalTotalVal').textContent = `$${finalPrice}.00`;
    document.getElementById('planPriceDisplay').innerHTML = `$${finalPrice}.00 <span class="val-sub">/ ${isMonthly ? 'mo' : 'once'}</span>`;
    document.getElementById('planBinCountDisplay').textContent = `${bins} Bins Included (${Math.min(2, bins)} Base + ${Math.max(0, bins - 2)} Extra)`;
    document.getElementById('nextInvoiceDate').textContent = `Next auto-charge of $${finalPrice}.00 on Sept 1, 2026`;
  }

  // Bin Counter Controls
  document.getElementById('btnPortalBinMinus').addEventListener('click', () => {
    let count = parseInt(document.getElementById('portalBinCount').textContent) || 2;
    if (count > 1) {
      document.getElementById('portalBinCount').textContent = count - 1;
      updatePlanCalculations();
    }
  });

  document.getElementById('btnPortalBinPlus').addEventListener('click', () => {
    let count = parseInt(document.getElementById('portalBinCount').textContent) || 2;
    if (count < 10) {
      document.getElementById('portalBinCount').textContent = count + 1;
      updatePlanCalculations();
    }
  });

  document.querySelectorAll('input[name="planFreq"]').forEach(radio => {
    radio.addEventListener('change', updatePlanCalculations);
  });

  // User Role Selector
  document.getElementById('userRoleSelector').addEventListener('change', (e) => {
    currentUser = users[e.target.value] || users.john_sj;
    localStorage.setItem('hygeia_current_user', JSON.stringify(currentUser));
    renderUser();
  });

  // Stripe Modal
  const stripeModal = document.getElementById('stripeModal');
  const btnManageStripe = document.getElementById('btnManageStripe');
  const btnEditSub = document.getElementById('btnEditSubscription');
  const btnCloseStripe = document.getElementById('btnCloseStripe');

  function openStripe() {
    const isMonthly = document.getElementById('radioMonthly').checked;
    const bins = document.getElementById('portalBinCount').textContent;
    const total = document.getElementById('portalTotalVal').textContent;

    document.getElementById('stripePlanTitle').textContent = isMonthly ? "Monthly Curbside Sanitizing Subscription" : "One-Time Curbside Wash";
    document.getElementById('stripePlanDetails').textContent = `${bins} Bins · ${isMonthly ? 'Auto-renews monthly · Cancel anytime' : 'Single occurrence'}`;
    document.getElementById('stripePriceTotal').textContent = `${total}${isMonthly ? '/mo' : ''}`;
    
    stripeModal.classList.add('open');
  }

  btnManageStripe.addEventListener('click', openStripe);
  btnEditSub.addEventListener('click', openStripe);
  document.getElementById('btnSavePlan').addEventListener('click', openStripe);
  document.getElementById('btnUpdateCard').addEventListener('click', openStripe);
  btnCloseStripe.addEventListener('click', () => stripeModal.classList.remove('open'));

  window.simulateStripeSuccess = function() {
    currentUser.bins = parseInt(document.getElementById('portalBinCount').textContent);
    currentUser.price = parseInt(document.getElementById('portalTotalVal').textContent.replace('$', ''));
    localStorage.setItem('hygeia_current_user', JSON.stringify(currentUser));
    stripeModal.classList.remove('open');
    alert('✓ Stripe Payment Method & Subscription successfully updated! Confirmation receipt sent to your email.');
    renderUser();
  };

  document.getElementById('btnSkipWash').addEventListener('click', () => {
    if (confirm('Would you like to pause/skip next week's wash? Your billing will be adjusted automatically.')) {
      alert('✓ Next wash skipped. Your schedule will resume the following month.');
    }
  });

  document.getElementById('btnRequestAddon').addEventListener('click', () => {
    alert('Choose your preferred add-on in the Member Exclusive box below or call dispatch at (650) 933-3823.');
  });

  document.getElementById('formPropertyNotes').addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser.gateCode = document.getElementById('inputGateCode').value;
    currentUser.phone = document.getElementById('inputNotifyPhone').value;
    localStorage.setItem('hygeia_current_user', JSON.stringify(currentUser));
    alert('✓ Property access notes and notification phone number updated!');
  });

  renderUser();
})();
