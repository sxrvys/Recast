#!/usr/bin/env python3
"""Build a clean, relocatable Recast device and optional distributable ZIP."""
import argparse,hashlib,json,struct,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'MaxForLive'
VERSION='0.1.0-beta.3'
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--zip',action='store_true',help='Also produce dist/Recast-<version>.zip')
p.add_argument('--output',type=Path,default=ROOT/'dist/Recast')
a=p.parse_args();out=a.output.resolve();out.mkdir(parents=True,exist_ok=True)
# Follow the entry point; never package retired prototypes or local QA harnesses.
names=['recast-native.js']
import re
names+=re.findall(r'include\("([^\"]+)"\)',(SRC/names[0]).read_text())
assert len(names)==len(set(names))==29
inputs=names+['recast-voice.maxpat','Recast.maxpat']
digest=hashlib.sha256(b''.join((SRC/n).read_bytes() for n in sorted(inputs))).hexdigest()[:12]
prefix='recast-'+digest+'-'
manifest=[]
for n in names:
 text=(SRC/n).read_text().replace('autowatch = 1;','autowatch = 0;').replace('recast-',prefix)
 target=n.replace('recast-',prefix);(out/target).write_text(text);manifest.append(target)
voice=prefix+'voice.maxpat';(out/voice).write_bytes((SRC/'recast-voice.maxpat').read_bytes());manifest.append(voice)
patch=json.loads((SRC/'Recast.maxpat').read_text().replace('recast-',prefix))
# AMXD container: fixed metadata header, then NUL-terminated JSON patcher body.
body=json.dumps(patch,indent=2).encode()+b'\0'
header=bytes.fromhex('616d706604000000696969696d657461040000000000000070746368')+struct.pack('<I',len(body))
(out/'Recast.amxd').write_bytes(header+body);manifest.append('Recast.amxd')
for source,target in [(ROOT/'README.md','README.md'),(ROOT/'LICENSE','LICENSE'),(SRC/'README.txt','USER-GUIDE.txt'),(ROOT/'docs/ARCHITECTURE.md','docs/ARCHITECTURE.md'),(ROOT/'docs/RHYTHM.md','docs/RHYTHM.md')]:
 (out/target).parent.mkdir(parents=True,exist_ok=True);(out/target).write_bytes(source.read_bytes());manifest.append(target)
(out/'Rendered').mkdir(exist_ok=True);(out/'Rendered/.gitkeep').touch();manifest.append('Rendered/.gitkeep')
info={'version':VERSION,'sourceHash':digest,'device':'Recast.amxd','files':manifest}
(out/'build-info.json').write_text(json.dumps(info,indent=2)+'\n');manifest.append('build-info.json')
if a.zip:
 archive=ROOT/'dist'/('Recast-'+VERSION+'.zip');archive.parent.mkdir(exist_ok=True)
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
  for name in sorted(manifest):z.write(out/name,'Recast/'+name)
 print(archive)
print(out/'Recast.amxd')
