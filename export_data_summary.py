import pandas as pd
import json

df_col = pd.read_excel('Collaborateurs.xlsx')
df_frais = pd.read_excel('frais.xlsx')

df_col = df_col.fillna('')
df_frais = df_frais.fillna('')

for col in df_col.columns:
    if pd.api.types.is_datetime64_any_dtype(df_col[col]):
        df_col[col] = df_col[col].astype(str)

for col in df_frais.columns:
    if pd.api.types.is_datetime64_any_dtype(df_frais[col]):
        df_frais[col] = df_frais[col].astype(str)

col_records = df_col.to_dict('records')
frais_records = df_frais.to_dict('records')

summary = {
    'total_collaborateurs': len(col_records),
    'total_frais_entries': len(frais_records),
    'months': [m for m in df_frais['Mois'].unique().tolist() if m],
    'weeks': [w for w in df_frais['Semaine'].unique().tolist() if w],
    'entities': [e for e in df_col['Entite'].unique().tolist() if e]
}

print(json.dumps(summary, indent=2, ensure_ascii=False))

# Export json files for inclusion in web app default state
with open('collaborateurs.json', 'w', encoding='utf-8') as f:
    json.dump(col_records, f, ensure_ascii=False, indent=2)

with open('frais.json', 'w', encoding='utf-8') as f:
    json.dump(frais_records, f, ensure_ascii=False, indent=2)

print("Exported collaborateurs.json and frais.json successfully!")
