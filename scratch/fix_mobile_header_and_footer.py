import re

with open('website/experience.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix top utility strip on mobile to remove the lone green dot
old_top_badge_mobile = """.top-status-badge span.long-text {
        display: none;
      }"""

new_top_badge_mobile = """.top-status-badge {
        display: none !important;
      }
      .top-utility-inner {
        justify-content: center;
        gap: 20px;
      }"""

content = content.replace(old_top_badge_mobile, new_top_badge_mobile)

# 2. Fix footer mobile alignment & layout in CSS
old_footer_mobile = """      .footer-main-grid {
        grid-template-columns: 1fr;
      }"""

new_footer_mobile = """      .footer-top-strip {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
        padding-bottom: 24px;
        margin-bottom: 32px;
      }
      .fleet-status-beacon {
        font-size: 11px;
        padding: 6px 14px;
        text-align: center;
        justify-content: center;
        width: 100%;
        max-width: 360px;
      }
      .footer-main-grid {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 36px;
      }
      .footer-mascot-hero-box {
        align-items: center;
        text-align: center;
        margin: 0 auto;
      }
      .footer-mascot-large {
        margin: 0 auto 12px auto;
        display: block;
        max-width: 200px;
      }
      .footer-brand-bio {
        text-align: center;
        max-width: 440px;
        margin: 0 auto 14px auto;
      }
      .footer-cert-chips-box {
        justify-content: center;
        margin: 0 auto;
      }
      .footer-nav-list {
        align-items: center;
        text-align: center;
      }
      .footer-dispatch-card {
        margin: 0 auto;
        max-width: 360px;
        text-align: center;
      }
      .footer-dispatch-card .dispatch-item {
        justify-content: center;
      }
      .footer-bottom-row {
        flex-direction: column;
        gap: 16px;
        text-align: center;
        justify-content: center;
      }
      .footer-legal-links {
        justify-content: center;
      }"""

content = content.replace(old_footer_mobile, new_footer_mobile)

# 3. Cache bust mascot image and wrap cert chips with footer-cert-chips-box class
content = content.replace(
    '<img src="assets/img/mascot-hero.png" alt="Hygeia Spartan Power Washer" class="footer-mascot-large"/>',
    '<img src="assets/img/mascot-hero.png?v=3" alt="Hygeia Spartan Power Washer" class="footer-mascot-large"/>'
)

content = content.replace(
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">\n              <span class="spec-badge">🎖️ CA DVBE #2054658</span>',
    '<div class="footer-cert-chips-box" style="display:flex;gap:8px;flex-wrap:wrap;">\n              <span class="spec-badge">🎖️ CA DVBE #2054658</span>'
)

with open('website/experience.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated experience.html with clean mobile mini-header and centered footer layout!')
