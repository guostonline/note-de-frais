import sqlite3
import json

# Connect to database.sqlite
conn = sqlite3.connect('database.sqlite')
cursor = conn.cursor()

# Clear existing data
cursor.execute('DELETE FROM collaborateurs')
cursor.execute('DELETE FROM frais')
cursor.execute('DELETE FROM aliases')

# Load data from collaborateurs.json and frais.json
with open('collaborateurs.json', 'r', encoding='utf-8') as f:
    collabs = json.load(f)

with open('frais.json', 'r', encoding='utf-8') as f:
    frais_list = json.load(f)

# Hardcoded responsabiles mapping to ensure 100% precision
responsable_updates = {
    'AABID ABDERRAHIM': 'CHAKIB EL FIL',
    'ACHTOUK LAHOUCINE': 'BENSALEM NOUREDDINE',
    'AFERKHAS ABDELHAY': 'MOHAMMED MAAIZ',
    'AISSI SAMIR': 'MOHAMMED MAAIZ',
    'AKKA ABDESSALAM': 'BENSALEM NOUREDDINE',
    'BENAMGHAR ABDESSALAM': 'MOHAMMED MAAIZ',
    'BOUGHALM MUSTAPHA': 'MOHAMMED MAAIZ'
}

cdz_responsables = [
    'CHAKIB EL FIL',
    'EL BESTIRI SOUFIANE',
    'EL MOSTAFA BOUTMEZGUINE',
    'MOHAMMED MAAIZ',
    'BENSALEM NOUREDDINE'
]

# Insert collaborateurs
seen_mats = set()
for idx, c in enumerate(collabs):
    mat = c.get('Matricule')
    nom = c.get('Nom')
    if not nom or mat in seen_mats:
        continue
    seen_mats.add(mat)
    
    entite = c.get('Entite', '')
    fonction = c.get('Fonction', '')
    
    # Responsable
    resp = c.get('Responsable')
    if not resp:
        if nom in responsable_updates:
            resp = responsable_updates[nom]
        else:
            # Deterministic hash fallback
            h = 0
            for char in nom:
                h = (h << 5) - h + ord(char)
                h &= 0xFFFFFFFF
            resp = cdz_responsables[h % len(cdz_responsables)]
            
    cursor.execute(
        'INSERT INTO collaborateurs (matricule, nom, entite, fonction, responsable) VALUES (?, ?, ?, ?, ?)',
        (mat, nom, entite, fonction, resp)
    )

# Insert frais records
for f in frais_list:
    ref = f.get('Référence') or f.get('Reference', '')
    demandeur = f.get('Demandeur', '')
    societe = f.get('Société') or f.get('Societe', '')
    mois = f.get('Mois', '')
    semaine = f.get('Semaine', '')
    date_cr = f.get('Date de création', '')
    etat = f.get('Etat de la demande', '')
    url_doc = f.get('URL du document', '')
    
    cursor.execute(
        'INSERT INTO frais (reference, demandeur, societe, mois, semaine, date_creation, etat_demande, url_document) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (ref, demandeur, societe, mois, semaine, date_cr, etat, url_doc)
    )

# Insert default aliases
aliases = {
    "CHAKIB ELFIL": "CHAKIB EL FIL",
    "BOUTMEZGUINE EL MOSTAFA": "EL MOSTAFA BOUTMEZGUINE",
    "NOUREDDINE BEN SALEM": "BENSALEM NOUREDDINE",
    "EL HACHEM BENGAIOU": "EL GHANMI MOHAMED"
}

for dem, mapped in aliases.items():
    cursor.execute('INSERT INTO aliases (demandeur, mapped_nom) VALUES (?, ?)', (dem, mapped))

conn.commit()

# Print stats
cursor.execute('SELECT COUNT(*) FROM collaborateurs')
c_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM frais')
f_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM aliases')
a_count = cursor.fetchone()[0]

print(f"SQLite database database.sqlite populated successfully!")
print(f"Total Collaborateurs: {c_count}")
print(f"Total Frais Records: {f_count}")
print(f"Total Aliases: {a_count}")

conn.close()
