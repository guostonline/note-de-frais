import openpyxl
import sqlite3
import json

excel_path = 'Liste_Collaborateurs_2026-08-11.xlsx'
wb = openpyxl.load_workbook(excel_path)
ws = wb['Collaborateurs']

# Extract header and data rows
rows = list(ws.iter_rows(values_only=True))
header = rows[0]
data_rows = rows[1:]

new_collabs = []
seen_mats = set()

for r in data_rows:
    if not any(r):
        continue
    # Columns: ['#', 'Matricule', 'Nom', 'Entite', 'Fonction', 'Responsable_CDZ_CDA']
    num, mat, nom, entite, fonction, resp = r[0], r[1], r[2], r[3], r[4], r[5]
    
    if not nom or mat in seen_mats:
        continue
    seen_mats.add(mat)
    
    new_collabs.append({
        'Entite': str(entite or '').strip(),
        'Matricule': int(mat) if mat is not None else 0,
        'Nom': str(nom or '').strip(),
        'Fonction': str(fonction or '').strip(),
        'Responsable': str(resp or '').strip()
    })

print(f"Parsed {len(new_collabs)} collaborators from {excel_path}")

# 1. Update collaborateurs.json
with open('collaborateurs.json', 'w', encoding='utf-8') as f:
    json.dump(new_collabs, f, ensure_ascii=False, indent=2)
print("Updated collaborateurs.json")

# 2. Re-create database.sqlite
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

cursor.execute('DROP TABLE IF EXISTS collaborateurs')
cursor.execute('''
CREATE TABLE collaborateurs (
    matricule INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    entite TEXT,
    fonction TEXT,
    responsable TEXT
)
''')

for c in new_collabs:
    cursor.execute(
        'INSERT INTO collaborateurs (matricule, nom, entite, fonction, responsable) VALUES (?, ?, ?, ?, ?)',
        (c['Matricule'], c['Nom'], c['Entite'], c['Fonction'], c['Responsable'])
    )

conn.commit()

# Print SQLite verification count
cursor.execute('SELECT COUNT(*) FROM collaborateurs')
db_collab_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM frais')
db_frais_count = cursor.fetchone()[0]
conn.close()

print(f"Re-created database.sqlite: {db_collab_count} collaborateurs, {db_frais_count} frais records")

# 3. Re-export database.sql
conn = sqlite3.connect('database.sqlite')
with open('database.sql', 'w', encoding='utf-8') as f:
    for line in conn.iterdump():
        f.write('%s\n' % line)
conn.close()
print("Re-exported database.sql")

# Copy to public/ directory for Vercel downloads
import shutil
shutil.copy('database.sqlite', 'public/database.sqlite')
shutil.copy('database.sql', 'public/database.sql')
print("Copied database.sqlite and database.sql to public/")

# 4. Update src/data/defaultData.js
# Read existing fraisList from defaultData.js
with open('src/data/defaultData.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract initialFrais array string
frais_start = content.find('export const initialFrais =')
frais_code = content[frais_start:] if frais_start != -1 else ''

new_default_data = f"""// Pre-loaded dataset extracted from Liste_Collaborateurs_2026-08-11.xlsx and frais.xlsx
export const initialCollaborateurs = {json.dumps(new_collabs, ensure_ascii=False, indent=2)};

{frais_code}"""

with open('src/data/defaultData.js', 'w', encoding='utf-8') as f:
    f.write(new_default_data)

print("Updated src/data/defaultData.js with 62 collaborators!")
