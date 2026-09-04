with open('scratch/build_experience_hub.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace active tab button style
old_tab_active = """.calc-tab-btn.active {
      background: var(--cyan-bright);
      border-color: var(--cyan-bright);
      color: #000000;
      box-shadow: 0 0 18px rgba(0, 180, 216, 0.5);
    }"""

new_tab_active = """.calc-tab-btn.active {
      background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
      border-color: #FFB703;
      color: #000000;
      box-shadow: 0 0 22px rgba(255, 183, 3, 0.5);
    }"""

content = content.replace(old_tab_active, new_tab_active)

# Replace calc-result-box & price
old_result_box = """.calc-result-box {
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid rgba(0, 240, 255, 0.35);
      border-radius: 18px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: inset 0 0 24px rgba(0, 180, 216, 0.1);
    }

    .calc-result-price {
      font-family: var(--font-mono);
      font-size: 40px;
      font-weight: 900;
      color: #00F0FF;
      margin-bottom: 4px;
    }"""

new_result_box = """.calc-result-box {
      background: linear-gradient(180deg, rgba(16, 26, 38, 0.9) 0%, rgba(8, 14, 22, 0.98) 100%);
      border: 1px solid rgba(255, 183, 3, 0.35);
      border-radius: 18px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), inset 0 0 24px rgba(255, 183, 3, 0.08);
    }

    .calc-result-price {
      font-family: var(--font-mono);
      font-size: 40px;
      font-weight: 900;
      color: #FFB703;
      text-shadow: 0 0 25px rgba(255, 183, 3, 0.4);
      margin-bottom: 4px;
    }"""

content = content.replace(old_result_box, new_result_box)

# Replace submit button
old_submit_btn = """.calc-btn-submit {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      background: linear-gradient(135deg, #00F0FF 0%, #0090FF 100%);
      border: none;
      padding: 14px 24px;
      border-radius: 999px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 20px rgba(0, 180, 216, 0.5);
      display: block;
    }

    .calc-btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 240, 255, 0.7);
    }"""

new_submit_btn = """.calc-btn-submit {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000000;
      background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
      border: none;
      padding: 14px 24px;
      border-radius: 999px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 22px rgba(255, 183, 3, 0.45);
      display: block;
    }

    .calc-btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(255, 183, 3, 0.75);
    }"""

content = content.replace(old_submit_btn, new_submit_btn)

# Replace counter & slider & chips
content = content.replace('accent-color:#00F0FF;', 'accent-color:#FFB703;')
content = content.replace('color:#00F0FF;', 'color:#FFB703;')
content = content.replace('.counter-btn:hover {\n      background: var(--cyan-bright);', '.counter-btn:hover {\n      background: #FFB703;')
content = content.replace('.counter-val {\n      font-family: var(--font-mono);\n      font-size: 20px;\n      font-weight: 900;\n      color: #00F0FF;\n    }', '.counter-val {\n      font-family: var(--font-mono);\n      font-size: 20px;\n      font-weight: 900;\n      color: #FFB703;\n    }')
content = content.replace('.preset-chip-btn:hover {\n      background: rgba(0, 180, 216, 0.2);\n      border-color: var(--cyan-bright);\n      color: #00F0FF;\n    }', '.preset-chip-btn:hover {\n      background: rgba(255, 183, 3, 0.18);\n      border-color: #FFB703;\n      color: #FFB703;\n    }')

# Section tag & title
content = content.replace('<h2 class="section-title">Live Instant Price Estimator</h2>', '<h2 class="section-title">Live Instant <span style="color:#FFB703;">Price Estimator</span></h2>')

# Story tags in calc results
content = content.replace('<span class="story-tag"><i class="fa-solid fa-sparkles"></i> ESTIMATED TOTAL</span>', '<span class="story-tag" style="background:rgba(255,183,3,0.12);border-color:rgba(255,183,3,0.4);color:#FFB703;"><i class="fa-solid fa-sparkles" style="color:#FFB703;"></i> ESTIMATED TOTAL</span>')
content = content.replace('<span class="story-tag"><i class="fa-solid fa-house-chimney"></i> RESIDENTIAL ESTIMATE</span>', '<span class="story-tag" style="background:rgba(255,183,3,0.12);border-color:rgba(255,183,3,0.4);color:#FFB703;"><i class="fa-solid fa-house-chimney" style="color:#FFB703;"></i> RESIDENTIAL ESTIMATE</span>')
content = content.replace('<span class="story-tag"><i class="fa-solid fa-building"></i> COMMERCIAL RANGE</span>', '<span class="story-tag" style="background:rgba(255,183,3,0.12);border-color:rgba(255,183,3,0.4);color:#FFB703;"><i class="fa-solid fa-building" style="color:#FFB703;"></i> COMMERCIAL RANGE</span>')

with open('scratch/build_experience_hub.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated scratch/build_experience_hub.py with gold accents!')
