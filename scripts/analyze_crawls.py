import json

def inspect(path, name):
    print(f"\n==================== {name} ====================")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    idx = text.find('{')
    data = json.loads(text[idx:])
    
    print("\n--- TOP FIXES ---")
    for fix in data.get('topFixes', []):
        print(f"[{fix.get('severity')}] {fix.get('ruleId')}: {fix.get('title')}")
        print(f"  Count: {fix.get('count')}")
        print(f"  Fix: {fix.get('howToFix')}")
        print(f"  Sample URLs: {fix.get('sampleUrls', [])[:3]}")

    print("\n--- ISSUES SUMMARY BY RULE ---")
    issues_by_rule = {}
    for iss in data.get('issues', []):
        rule = iss.get('ruleId')
        if rule not in issues_by_rule:
            issues_by_rule[rule] = {
                'title': iss.get('title'),
                'severity': iss.get('severity'),
                'category': iss.get('category'),
                'urls': []
            }
        issues_by_rule[rule]['urls'].append(iss.get('url'))

    for rule, info in sorted(issues_by_rule.items(), key=lambda x: (x[1]['severity'] != 'high', x[1]['severity'] != 'medium')):
        print(f"[{info['severity'].upper()}] {rule} ({len(info['urls'])} pages) - {info['title']}")
        for u in info['urls'][:3]:
            print(f"    - {u}")

inspect(r'C:/Users/dell/.gemini/antigravity/brain/9b2761ed-8bea-48f8-ae6e-782a19a3ee17/.system_generated/steps/3403/output.txt', "PWS SITE")
inspect(r'C:/Users/dell/.gemini/antigravity/brain/9b2761ed-8bea-48f8-ae6e-782a19a3ee17/.system_generated/steps/3410/output.txt', "JANITORIAL SITE")
