# Merges the medical precinct's corrections (JSON on stdin, from med-corrections.mjs) into corrections.json, replacing
# entries with the same ids and keeping the file's own formatting.
import json, sys
FILE = 'data/geography/registry/corrections.json'
new = json.load(sys.stdin)
c = json.load(open(FILE))
for key in ('reshape', 'exclude', 'addAreas', 'addWays'):
    ids = {e['id'] for e in new.get(key, [])}
    c[key] = [e for e in c[key] if e['id'] not in ids] + new.get(key, [])
open(FILE, 'w').write(json.dumps(c, indent=2) + '\n')
print({k: len(v) for k, v in new.items()})
