import pandas as pd
import re

df_col = pd.read_excel('Collaborateurs.xlsx')
df_frais = pd.read_excel('frais.xlsx')

col_names = df_col['Nom'].dropna().unique()
frais_names = df_frais['Demandeur'].dropna().unique()

def normalize(name):
    name = str(name).upper().strip()
    name = re.sub(r"[^A-Z0-9\s]", " ", name)
    words = sorted([w for w in name.split() if w])
    return " ".join(words)

norm_col = {n: normalize(n) for n in col_names}
norm_frais = {n: normalize(n) for n in frais_names}

col_norm_map = {}
for orig, n in norm_col.items():
    col_norm_map[n] = orig

matched = 0
unmatched_frais = []
for orig_f, n_f in norm_frais.items():
    if n_f in col_norm_map:
        matched += 1
    else:
        words_f = set(n_f.split())
        best_match = None
        best_overlap = 0
        for orig_c, n_c in norm_col.items():
            words_c = set(n_c.split())
            overlap = len(words_f.intersection(words_c))
            if overlap > best_overlap:
                best_overlap = overlap
                best_match = orig_c
        unmatched_frais.append((orig_f, n_f, best_match, best_overlap))

print(f"Matched directly (set of sorted words): {matched} / {len(frais_names)}")
print("\nUnmatched Frais names and best Collab candidates:")
for u in unmatched_frais:
    print(f"Frais: '{u[0]}' -> Collab Candidate: '{u[2]}' (Overlap words: {u[3]})")

print("\n--- Frais Breakdown by Mois and Semaine ---")
frais_summary = df_frais.groupby(['Mois', 'Semaine'])['Demandeur'].nunique().reset_index()
print(frais_summary)

print("\n--- Unique Months in Frais ---")
print(df_frais['Mois'].unique())

print("\n--- Unique Weeks per Month in Frais ---")
for m, grp in df_frais.groupby('Mois'):
    print(f"Month: {m} -> Weeks: {grp['Semaine'].unique().tolist()}")
