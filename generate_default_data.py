import json
import os

with open('collaborateurs.json', 'r', encoding='utf-8') as f:
    collab = json.load(f)

with open('frais.json', 'r', encoding='utf-8') as f:
    frais = json.load(f)

os.makedirs('src/data', exist_ok=True)

with open('src/data/defaultData.js', 'w', encoding='utf-8') as f:
    f.write("// Pre-loaded dataset extracted from Collaborateurs.xlsx and frais.xlsx\n")
    f.write("export const initialCollaborateurs = ")
    json.dump(collab, f, ensure_ascii=False, indent=2)
    f.write(";\n\n")
    f.write("export const initialFrais = ")
    json.dump(frais, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print("Generated src/data/defaultData.js successfully!")
