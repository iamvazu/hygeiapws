import os
import re
from bs4 import BeautifulSoup

# Map of specific titles to optimize per seo-title-optimization (<= 60 chars)
PWS_TITLE_MAP = {
    "index.html": ("Commercial Pressure Washing & Bin Cleaning San Jose | Hygeia", 
                   "Silicon Valley's commercial pressure washing, curbside trash bin sanitizing, and EPA wastewater recovery. Serving San Jose, Santa Clara, and the Peninsula."),
    "experience.html": ("3D Wash Rig & EPA Water Reclaim Experience | Hygeia", None),
    "commercial-pressure-washing.html": ("Commercial Pressure Washing San Jose CA | Hygeia", None),
    "bin-cleaning.html": ("Trash Can Cleaning San Jose CA | 200° Wash | Hygeia", None),
    "about.html": ("About Hygeia | Silicon Valley Power Washing Heritage", None),
    "contact.html": ("Get a Free Quote & Dispatch | Hygeia Power Wash", None),
    "faq.html": ("Power Washing FAQs | Hygeia Silicon Valley", None),
    "blog.html": ("Commercial Power Washing Blog & Guides | Hygeia", None),
    "residential-power-washing.html": ("Residential Power Washing San Jose & Peninsula | Hygeia", None),
    "california-privacy.html": ("California Privacy Notice (CCPA/CPRA) | Hygeia PWS", None),
    "portal.html": ("Client Subscription Portal | Hygeia Power Wash", None),
}

JS_TITLE_MAP = {
    "index.html": ("Commercial Janitorial & Day Porter San Jose | Hygeia",
                   "Silicon Valley commercial janitorial services, day porters, ISO cleanroom sanitization, and hospital terminal cleaning. Certified CA DVBE #2054658."),
    "experience.html": ("3D Digital Twin Facility Walkthrough | Hygeia Janitorial", None),
    "about.html": ("About Hygeia | Silicon Valley Commercial Janitorial",
                   "Learn about Hygeia's 35-year heritage providing commercial janitorial, medical sanitization, and day porter staffing to Silicon Valley facilities."),
    "why-hygeia.html": ("Why Hygeia | Vetted Medical & Campus Cleaning Experts",
                        "Discover why Fortune 500 tech campuses, surgery centers, and biotech labs choose Hygeia for specialized commercial janitorial in Silicon Valley."),
    "blog.html": ("Commercial Janitorial & Facility Blog | Hygeia", None),
    "contact.html": ("Request Janitorial Site Analysis & Quote | Hygeia", None),
    "faqs.html": ("Commercial Janitorial FAQs | Hygeia Silicon Valley", None),
    "industries.html": ("Commercial Janitorial Industries Served | Hygeia", None),
    "portal.html": ("Client Operations Portal | Hygeia Commercial Janitorial", None),
    "california-privacy.html": ("California Privacy Notice (CCPA) | Hygeia Janitorial", None),
}

# Blog title simplifications (Target 40-58 chars)
BLOG_TITLE_RULES = [
    (r"How Often Should Commercial Buildings Be Pressure Washed in Northern California\?.*", "Commercial Building Pressure Washing Schedule | Hygeia"),
    (r"How Much Does Commercial Pressure Washing Cost in Silicon Valley\?.*", "Commercial Pressure Washing Cost in Silicon Valley | Hygeia"),
    (r"The Hidden Health Risks in Unsanitized Wheelie Bins.*", "Wheelie Bin Bacteria & Disease Risks: E. Coli | Hygeia"),
    (r"Dumpster Pad Degreasing: Passing Santa Clara County Health.*", "Dumpster Pad Cleaning & Health Code Rules | Hygeia"),
    (r"California Clean Water Act & EPA Stormwater Regulations.*", "EPA Stormwater Compliance for Pressure Washing | Hygeia"),
    (r"Commercial EV Charging Station Power Washing.*", "Commercial EV Charging Pad Pressure Washing | Hygeia"),
    (r"Emergency Commercial Graffiti Removal in San Jose.*", "Emergency Commercial Graffiti Removal San Jose | Hygeia"),
    (r"The HOA Property Manager's Guide to Exterior Pressure Washing.*", "HOA Exterior Pressure Washing Standards Guide | Hygeia"),
    (r"Biotech Cleanroom & Laboratory Janitorial Standards.*", "Biotech Cleanroom Janitorial Standards (ISO 7/8) | Hygeia"),
    (r"California DVBE & Small Business Procurement Guidelines.*", "California DVBE Janitorial Procurement Guide | Hygeia"),
    (r"Commercial Hard Floor Stripping & Waxing Lifecycles.*", "Commercial Floor Stripping & Waxing Guide | Hygeia"),
    (r"How On-Site Day Porters Elevate Class-A Properties.*", "Day Porter Benefits for Class-A Properties | Hygeia"),
    (r"School, Daycare & University Janitorial Standards.*", "School & Daycare Janitorial Standards in NorCal | Hygeia"),
    (r"Commercial Emergency Spill & Water Intrusion.*", "Commercial Emergency Spill & Water Intrusion | Hygeia"),
    (r"Green Seal Certified Janitorial & Indoor Air Quality.*", "LEED v4.1 Green Janitorial Cleaning Standards | Hygeia"),
    (r"Healthcare & Medical Clinic Terminal Disinfection.*", "Medical Clinic Terminal Disinfection Protocols | Hygeia"),
    (r"Commercial Carpet Care & Hot-Water Extraction.*", "Commercial Carpet Cleaning & Maintenance Guide | Hygeia"),
    (r"Retail Center & Grocery Store Nightly Janitorial.*", "Retail & Grocery Store Nightly Janitorial Guide | Hygeia"),
    (r"Warehouse & Distribution Center High-Dusting.*", "Warehouse High-Dusting & Concrete Floor Care | Hygeia"),
    (r"Commercial Restroom Deep-Cleaning & Odor Elimination.*", "Commercial Restroom Sanitization & Odor Control | Hygeia"),
    (r"Parking Garage & Structure Pressure Washing.*", "Parking Garage Pressure Washing Standards | Hygeia"),
    (r"Sidewalk Gum Removal & Concrete Restoration.*", "Sidewalk Gum Removal & Concrete Restoration | Hygeia"),
    (r"Solar Panel Cleaning & Efficiency Optimization.*", "Commercial Solar Panel Cleaning & Efficiency | Hygeia"),
    (r"Fleet Washing & Mobile Truck Wash Standards.*", "Commercial Fleet Washing & Wastewater Rules | Hygeia"),
    (r"Commercial Window Cleaning & Water-Fed Pole Systems.*", "Commercial Window Cleaning Standards in Bay Area | Hygeia"),
    (r"Soft Wash vs\. Pressure Wash: What Commercial Buildings Need.*", "Soft Wash vs Pressure Wash for Commercial Walls | Hygeia"),
    (r"Shopping Center Exterior Maintenance Checklist.*", "Shopping Center Exterior Maintenance Checklist | Hygeia"),
    (r"Post-Construction Exterior Cleanup & Power Washing.*", "Post-Construction Exterior Power Washing Guide | Hygeia"),
    (r"Condo & Apartment Complex Common Area Cleaning.*", "Apartment Complex Common Area Pressure Washing | Hygeia"),
    (r"Restaurant Patio & Outdoor Dining Pressure Washing.*", "Restaurant Patio Pressure Washing & Sanitizing | Hygeia"),
    (r"Drive-Thru Lane Cleaning & Oil Stain Removal.*", "Commercial Drive-Thru Lane Degreasing Guide | Hygeia"),
]

def optimize_file(file_path, title_map, is_blog=False):
    filename = os.path.basename(file_path)
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    modified = False

    # Check title map
    if filename in title_map:
        new_title, new_desc = title_map[filename]
        # Replace title
        title_pattern = re.compile(r'<title>(.*?)</title>', re.IGNORECASE | re.DOTALL)
        if title_pattern.search(content):
            old_title = title_pattern.search(content).group(1).strip()
            if old_title != new_title:
                content = title_pattern.sub(f"<title>{new_title}</title>", content, count=1)
                print(f"[TITLE UPDATE] {filename}: '{old_title}' -> '{new_title}' ({len(new_title)}c)")
                modified = True

        if new_desc:
            desc_pattern = re.compile(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']', re.IGNORECASE)
            desc_pattern2 = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', re.IGNORECASE)
            if desc_pattern.search(content):
                content = desc_pattern.sub(f'<meta content="{new_desc}" name="description"', content, count=1)
                modified = True
            elif desc_pattern2.search(content):
                content = desc_pattern2.sub(f'<meta name="description" content="{new_desc}"', content, count=1)
                modified = True

    # Check blog rules
    if is_blog:
        title_pattern = re.compile(r'<title>(.*?)</title>', re.IGNORECASE | re.DOTALL)
        m = title_pattern.search(content)
        if m:
            curr_title = m.group(1).strip()
            for pattern, replacement in BLOG_TITLE_RULES:
                if re.search(pattern, curr_title, re.IGNORECASE):
                    if curr_title != replacement:
                        content = title_pattern.sub(f"<title>{replacement}</title>", content, count=1)
                        print(f"[BLOG TITLE] {filename}: '{curr_title}' -> '{replacement}' ({len(replacement)}c)")
                        modified = True
                    break

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Starting title & meta optimization...")
# PWS
for fname, val in PWS_TITLE_MAP.items():
    fpath = os.path.join("website", fname)
    if os.path.exists(fpath):
        optimize_file(fpath, PWS_TITLE_MAP)

# JS
for fname, val in JS_TITLE_MAP.items():
    fpath = os.path.join("jswebsite", fname)
    if os.path.exists(fpath):
        optimize_file(fpath, JS_TITLE_MAP)

# PWS Blog
for bfile in os.listdir("website/blog"):
    if bfile.endswith(".html"):
        optimize_file(os.path.join("website/blog", bfile), {}, is_blog=True)

# JS Blog
for bfile in os.listdir("jswebsite/blog"):
    if bfile.endswith(".html"):
        optimize_file(os.path.join("jswebsite/blog", bfile), {}, is_blog=True)

print("Finished title & meta optimization.")
