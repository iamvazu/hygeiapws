import os
import glob
from bs4 import BeautifulSoup

def audit_directory(root_dir, site_name):
    print(f"\n==================== CODE AUDIT: {site_name} ({root_dir}) ====================")
    html_files = glob.glob(f"{root_dir}/**/*.html", recursive=True)
    print(f"Total HTML files found: {len(html_files)}")

    titles = {}
    descriptions = {}
    missing_h1 = []
    multiple_h1 = []
    missing_canonical = []
    canonicals = {}
    missing_desc = []
    title_length_issues = []
    missing_og = []
    missing_schema = []

    for file_path in html_files:
        rel_path = os.path.relpath(file_path, root_dir).replace('\\', '/')
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        soup = BeautifulSoup(content, 'html.parser')

        # Title
        title_tag = soup.find('title')
        if not title_tag or not title_tag.text.strip():
            title_length_issues.append((rel_path, 0, "MISSING TITLE"))
        else:
            t = title_tag.text.strip()
            titles.setdefault(t, []).append(rel_path)
            if len(t) > 60:
                title_length_issues.append((rel_path, len(t), f"TOO LONG ({len(t)}): {t}"))
            elif len(t) < 30:
                title_length_issues.append((rel_path, len(t), f"TOO SHORT ({len(t)}): {t}"))

        # Meta description
        meta_desc = soup.find('meta', attrs={'name': lambda x: x and x.lower() == 'description'})
        if not meta_desc or not meta_desc.get('content', '').strip():
            missing_desc.append(rel_path)
        else:
            d = meta_desc['content'].strip()
            descriptions.setdefault(d, []).append(rel_path)

        # Canonical
        canonical_tag = soup.find('link', attrs={'rel': 'canonical'})
        if not canonical_tag or not canonical_tag.get('href', '').strip():
            missing_canonical.append(rel_path)
        else:
            canonicals[rel_path] = canonical_tag['href'].strip()

        # H1
        h1s = soup.find_all('h1')
        if len(h1s) == 0:
            missing_h1.append(rel_path)
        elif len(h1s) > 1:
            multiple_h1.append((rel_path, len(h1s)))

        # Schema JSON-LD
        schema_scripts = soup.find_all('script', attrs={'type': 'application/ld+json'})
        if not schema_scripts:
            missing_schema.append(rel_path)

        # OG tags
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_image = soup.find('meta', attrs={'property': 'og:image'})
        if not og_title or not og_image:
            missing_og.append(rel_path)

    # Report
    print(f"\n1. Duplicate Titles ({sum(1 for v in titles.values() if len(v) > 1)} duplicates):")
    for t, files in titles.items():
        if len(files) > 1:
            print(f"   '{t}' appears in {len(files)} files: {files[:3]}")

    print(f"\n2. Title Length Issues (Target 40-55 chars, max 60): {len(title_length_issues)} files")
    for rel_path, length, msg in title_length_issues[:10]:
        print(f"   - [{rel_path}] {msg}")

    print(f"\n3. Missing Meta Descriptions: {len(missing_desc)} files")
    if missing_desc:
        print(f"   Files: {missing_desc[:10]}")

    print(f"\n4. Duplicate Meta Descriptions ({sum(1 for v in descriptions.values() if len(v) > 1)} duplicates):")
    for d, files in descriptions.items():
        if len(files) > 1:
            print(f"   '{d[:60]}...' appears in {len(files)} files: {files[:3]}")

    print(f"\n5. Missing Canonical Tags: {len(missing_canonical)} files")
    if missing_canonical:
        print(f"   Files: {missing_canonical}")

    print(f"\n6. Canonical Host Sample (first 5):")
    for r, c in list(canonicals.items())[:5]:
        print(f"   {r} -> {c}")

    print(f"\n7. Missing H1: {len(missing_h1)} files | Multiple H1: {len(multiple_h1)} files")
    if missing_h1:
        print(f"   Missing H1 files: {missing_h1}")
    if multiple_h1:
        print(f"   Multiple H1 files: {multiple_h1[:5]}")

    print(f"\n8. Missing Structured Data (JSON-LD): {len(missing_schema)} files")
    if missing_schema:
        print(f"   Files: {missing_schema[:10]}")

    print(f"\n9. Missing OpenGraph (og:title or og:image): {len(missing_og)} files")
    if missing_og:
        print(f"   Files: {missing_og[:10]}")

if __name__ == '__main__':
    audit_directory('website', 'Hygeia Power Wash Solutions (PWS)')
    audit_directory('jswebsite', 'Hygeia Janitorial Services')
