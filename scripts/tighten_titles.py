import re

REPLACEMENTS = [
    # website/
    ("website/residential-pressure-washing.html", "Residential Pressure Washing San Jose & Peninsula | Hygeia"),
    ("website/service-areas.html", "Pressure Washing Service Areas Silicon Valley | Hygeia"),
    ("website/blog/hospital-medical-facility-exterior-sanitization.html", "Healthcare Exterior Sanitization Standards | Hygeia"),
    ("website/blog/how-to-choose-commercial-pressure-washing-contractor-bay-area.html", "Hiring a Commercial Power Washing Contractor | Hygeia"),
    ("website/blog/parking-garage-oil-stain-removal-guide.html", "Parking Garage Oil & Tire Stain Removal Guide | Hygeia"),
    ("website/blog/pool-deck-paver-sealing-benefits-silicon-valley.html", "Travertine & Paver Sealing in Silicon Valley | Hygeia"),
    ("website/blog/residential-driveway-power-washing-tips-bay-area.html", "Concrete Driveway Cleaning Guide for Homeowners | Hygeia"),
    ("website/blog/residential-vs-commercial-pressure-washer-equipment.html", "Commercial vs DIY Pressure Washer Equipment | Hygeia"),
    ("website/blog/restaurant-patio-grease-cleaning-standards.html", "Restaurant Patio Grease Extraction Standards | Hygeia"),
    
    # jswebsite/
    ("jswebsite/service-areas.html", "Commercial Janitorial Service Areas | Hygeia"),
    ("jswebsite/services.html", "Commercial Janitorial & Cleaning Services | Hygeia"),
    ("jswebsite/blog/post-construction-cleaning-bay-area-contractors.html", "Post-Construction Rough & Final Cleaning Guide | Hygeia"),
    ("jswebsite/blog/property-management-commercial-cleaning-playbook.html", "Property Manager's Janitorial Playbook | Hygeia"),
    ("jswebsite/blog/restaurant-kitchen-health-inspection-cleaning.html", "Commercial Kitchen Health Inspection Cleaning | Hygeia"),
    ("jswebsite/blog/silicon-valley-commercial-cleaning-guide-2026.html", "Silicon Valley Commercial Janitorial Scope Guide | Hygeia"),
    ("jswebsite/industries/healthcare-facilities.html", "Healthcare & Medical Facility Cleaning | Hygeia"),
    ("jswebsite/industries/museums-galleries.html", "Museum & Cultural Venue Janitorial | Hygeia"),
    ("jswebsite/industries/office-cleaning.html", "Tech Office Cleaning & Corporate Janitorial | Hygeia"),
    ("jswebsite/industries/industrial-manufacturing.html", "Industrial & Manufacturing Cleaning | Hygeia"),
    ("jswebsite/industries/educational-facilities.html", "School & University Janitorial Cleaning | Hygeia"),
    ("jswebsite/industries/fitness-wellness.html", "Fitness Center & Gym Janitorial Cleaning | Hygeia"),
    ("jswebsite/industries/commercial-property-management.html", "Commercial Property Management Janitorial | Hygeia"),
    ("jswebsite/industries/biotech-pharma.html", "Biotech & Pharma Cleanroom Janitorial | Hygeia"),
    ("jswebsite/industries/data-centers.html", "Mission-Critical Data Center Cleaning | Hygeia"),
]

for path, new_title in REPLACEMENTS:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        title_pattern = re.compile(r'<title>(.*?)</title>', re.IGNORECASE | re.DOTALL)
        old_title = title_pattern.search(content).group(1).strip()
        content = title_pattern.sub(f"<title>{new_title}</title>", content, count=1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}: '{old_title}' -> '{new_title}' ({len(new_title)}c)")
    except Exception as e:
        print(f"Error {path}: {e}")
