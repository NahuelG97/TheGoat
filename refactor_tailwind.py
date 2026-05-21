#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Tailwind to CSS variable mappings
replacements = [
    # Colors
    (r'bg-gray-900', 'style={{ backgroundColor: "transparent" }} className="bg-gray-900"'),  # placeholder
    (r'text-gray-900', 'style={{ color: "var(--text-primary)" }}'),
    (r'text-gray-700', 'style={{ color: "var(--text-primary)" }}'),
    (r'text-gray-600', 'style={{ color: "var(--text-secondary)" }}'),
    (r'text-gray-500', 'style={{ color: "var(--text-tertiary)" }}'),
    (r'bg-white', 'style={{ backgroundColor: "var(--card-bg)" }}'),
    (r'bg-gray-50', 'style={{ backgroundColor: "var(--bg-secondary)" }}'),
    (r'bg-gray-100', 'style={{ backgroundColor: "var(--bg-secondary)" }}'),
    (r'border-gray-300', 'style={{ borderColor: "var(--border-color)" }}'),
    (r'border-gray-200', 'style={{ borderColor: "var(--border-color)" }}'),
    (r'border-gray-400', 'style={{ borderColor: "var(--border-color)" }}'),
    (r'bg-blue-500', 'style={{ backgroundColor: "var(--accent)" }}'),
    (r'bg-blue-600', 'style={{ backgroundColor: "var(--accent)" }}'),
    (r'bg-red-600', 'style={{ backgroundColor: "var(--linear-red)" }}'),
    (r'bg-red-100', 'style={{ backgroundColor: "var(--danger-bg)" }}'),
    (r'bg-green-500', 'style={{ backgroundColor: "var(--linear-green)" }}'),
    (r'bg-green-600', 'style={{ backgroundColor: "var(--linear-green)" }}'),
    (r'bg-orange-500', 'style={{ backgroundColor: "var(--linear-orange)" }}'),
    (r'bg-orange-600', 'style={{ backgroundColor: "var(--linear-orange)" }}'),
    (r'text-red-600', 'style={{ color: "var(--linear-red)" }}'),
    (r'text-green-600', 'style={{ color: "var(--linear-green)" }}'),
    (r'text-orange-600', 'style={{ color: "var(--linear-orange)" }}'),
    (r'text-blue-600', 'style={{ color: "var(--accent)" }}'),
    
    # Spacing - convert to classes
    (r'className="p-4', 'className="'),  # Will handle separately
    (r'className="p-6', 'className="'),
    (r'className="px-4', 'className="'),
    (r'className="py-2', 'className="'),
    (r'className="py-3', 'className="'),
    (r'className="py-4', 'className="'),
    
    # Layout
    (r'className="flex', 'style={{ display: "flex" }} className="'),
    (r'className="grid', 'style={{ display: "grid" }} className="'),
    (r'className="gap-2', 'style={{ gap: "8px" }} className="'),
    (r'className="gap-4', 'style={{ gap: "16px" }} className="'),
    (r'className="gap-6', 'style={{ gap: "24px" }} className="'),
]

def process_file(filepath):
    """Process a single TypeScript/TSX file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # For now, return as-is - we'll do surgical replacements
        return content, False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None, False

def main():
    src_dir = Path("c:\\Users\\nahue\\Desktop\\The Goat Pages\\TheGoat\\frontend\\src")
    tsx_files = list(src_dir.rglob("*.tsx"))
    
    print(f"Found {len(tsx_files)} TSX files")
    for f in tsx_files:
        print(f"  - {f.relative_to(src_dir)}")

if __name__ == "__main__":
    main()
