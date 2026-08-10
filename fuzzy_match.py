import pandas as pd
import re
from difflib import SequenceMatcher

df_col = pd.read_excel('Collaborateurs.xlsx')
df_frais = pd.read_excel('frais.xlsx')

col_list = df_col[['Nom', 'Matricule', 'Fonction', 'Entite']].drop_duplicates().to_dict('records')
frais_list = df_frais['Demandeur'].dropna().unique().tolist()

def clean_str(s):
    if not isinstance(s, str): return ""
    s = s.upper().strip()
    s = re.sub(r'[^A-Z0-9]', ' ', s)
    return " ".join(s.split())

def match_score(name1, name2):
    # Normalized tokens set overlap
    t1 = set(clean_str(name1).split())
    t2 = set(clean_str(name2).split())
    if not t1 or not t2: return 0.0
    
    # Check word similarities across tokens
    matched_words = 0
    for w1 in t1:
        best_sim = max([SequenceMatcher(None, w1, w2).ratio() for w2 in t2], default=0)
        if best_sim >= 0.8:
            matched_words += 1
            
    token_score = (2.0 * matched_words) / (len(t1) + len(t2))
    seq_score = SequenceMatcher(None, clean_str(name1), clean_str(name2)).ratio()
    
    # Also check sorted characters
    sorted1 = "".join(sorted(clean_str(name1).replace(" ", "")))
    sorted2 = "".join(sorted(clean_str(name2).replace(" ", "")))
    sorted_score = SequenceMatcher(None, sorted1, sorted2).ratio()
    
    return max(token_score, seq_score * 0.9, sorted_score * 0.85)

results = []
for f_name in sorted(frais_list):
    best_c = None
    best_s = 0.0
    scores = []
    for c in col_list:
        score = match_score(f_name, c['Nom'])
        scores.append((score, c['Nom']))
        if score > best_s:
            best_s = score
            best_c = c['Nom']
    results.append({'Frais_Demandeur': f_name, 'Best_Collab_Match': best_c, 'Score': round(best_s, 2)})

res_df = pd.DataFrame(results)
print(res_df.to_string())

print(f"\nScore summary:")
print(f"Scores >= 0.7: {len(res_df[res_df['Score'] >= 0.7])} / {len(res_df)}")
print(f"Scores < 0.7: {len(res_df[res_df['Score'] < 0.7])}")

print("\n--- Low score matches (< 0.7) ---")
print(res_df[res_df['Score'] < 0.7].to_string())
