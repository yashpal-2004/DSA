
import os
import re

print("Running import check...")

def check_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all imported icons from lucide-react
    import_match = re.search(r"import \{([^}]+)\} from 'lucide-react'", content)
    if not import_match:
        import_match = re.search(r'import \{([^}]+)\} from "lucide-react"', content)
    
    imported_icons = set()
    if import_match:
        icons_str = import_match.group(1)
        # Handle aliases like 'Tooltip as RechartsTooltip'
        for part in icons_str.split(','):
            part = part.strip()
            if not part: continue
            if ' as ' in part:
                imported_icons.add(part.split(' as ')[1].strip())
            else:
                imported_icons.add(part)

    # Find all used icons in JSX <IconName or icon={<IconName
    used_icons = set(re.findall(r'<([A-Z][A-Za-z0-9]*)', content))
    used_icons_in_props = set(re.findall(r'icon=\{<([A-Z][A-Za-z0-9]*)', content))
    all_used = used_icons.union(used_icons_in_props)

    # Filter for lucide icons (assuming PascalCase and not common HTML/React components)
    common_tags = {'div', 'span', 'main', 'header', 'footer', 'aside', 'nav', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'button', 'input', 'select', 'option', 'textarea', 'kbd', 'h1', 'h2', 'h3', 'p', 'i', 'b', 'strong', 'em', 'br', 'hr', 'ul', 'ol', 'li', 'section', 'article', 'Fragment', 'Route', 'Routes', 'Router', 'Link', 'NavLink', 'Navigate', 'AnimatePresence', 'motion', 'ScrollToTop', 'ErrorBoundary'}
    
    # Also exclude recharts components
    recharts_tags = {'Radar', 'RadarChart', 'PolarGrid', 'PolarAngleAxis', 'PolarRadiusAxis', 'PieChart', 'Pie', 'Cell', 'ResponsiveContainer', 'Tooltip', 'RechartsTooltip'}
    
    # Also exclude our own components
    our_components = {'App', 'Sidebar', 'Dashboard', 'GFGSheet', 'TopicDetail', 'BookmarkPage', 'Roadmap', 'HomePage', 'ActivityTracker', 'CommandPalette', 'TopicCard', 'StatsCard', 'TimelineDay', 'RoadmapStep'}

    excludes = common_tags.union(recharts_tags).union(our_components)
    
    missing = []
    for icon in all_used:
        if icon not in imported_icons and icon not in excludes:
            missing.append(icon)
            
    return missing

components_dir = r"c:\Users\nikhi\OneDrive\Desktop\DSA 450\src\components"
for filename in os.listdir(components_dir):
    if filename.endswith(".jsx"):
        path = os.path.join(components_dir, filename)
        missing = check_imports(path)
        if missing:
            print(f"File: {filename} - Missing Imports: {missing}")

# Check App.jsx too
app_path = r"c:\Users\nikhi\OneDrive\Desktop\DSA 450\src\App.jsx"
missing = check_imports(app_path)
if missing:
    print(f"File: App.jsx - Missing Imports: {missing}")
