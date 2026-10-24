"""Disk-backed join of uncompressed Tatoeba detailed TSVs and explicit links.
Usage: python scripts/tatoeba.py deu_detailed.csv eng_detailed.csv links.csv pairs.jsonl
No inferred sense relationships. Standard detailed exports are CC BY 2.0 FR.
"""
import csv,json,sqlite3,sys,tempfile,hashlib
from pathlib import Path

def build(de,en,links,out):
    report={'sentences':0,'pairs':0,'duplicate_links':0,'missing_links':0,'source':'https://tatoeba.org/en/downloads','license':'CC-BY-2.0-FR','inputs':{}}
    with tempfile.TemporaryDirectory() as tmp:
        db=sqlite3.connect(tmp+'/join.sqlite');db.executescript('CREATE TABLE sentences(id INTEGER PRIMARY KEY, lang TEXT, text TEXT, user TEXT);CREATE TABLE pairs(de INTEGER,en INTEGER,PRIMARY KEY(de,en));')
        for path,lang in [(de,'deu'),(en,'eng')]:
            h=hashlib.sha256()
            with open(path,'rb') as f:
                for block in iter(lambda:f.read(1048576),b''):h.update(block)
            report['inputs'][str(path)]=h.hexdigest()
            with open(path,encoding='utf8',newline='') as f:
                for n,r in enumerate(csv.reader(f,delimiter='\t',quoting=csv.QUOTE_NONE),1):
                    if len(r)!=6 or r[1]!=lang or not r[0].isdigit():raise ValueError(f'{path}:{n}: detailed TSV schema/language mismatch')
                    db.execute('INSERT OR IGNORE INTO sentences VALUES(?,?,?,?)',(int(r[0]),lang,r[2],r[3] if r[3]!='\\N' else 'Tatoeba contributors'));report['sentences']+=1
            db.commit()
        with open(links,encoding='utf8') as f:
            for n,r in enumerate(csv.reader(f,delimiter='\t'),1):
                if len(r)!=2 or not all(x.isdigit() for x in r):raise ValueError(f'{links}:{n}: invalid link')
                a=db.execute('SELECT lang FROM sentences WHERE id=?',(r[0],)).fetchone();b=db.execute('SELECT lang FROM sentences WHERE id=?',(r[1],)).fetchone()
                if not a or not b:report['missing_links']+=1;continue
                if a[0]==b[0]:continue
                pair=(int(r[0]),int(r[1])) if a[0]=='deu' else (int(r[1]),int(r[0]))
                if not db.execute('INSERT OR IGNORE INTO pairs VALUES(?,?)',pair).rowcount:report['duplicate_links']+=1
        db.commit()
        with open(str(out)+'.tmp','w',encoding='utf8') as f:
            for deid,enid in db.execute('SELECT de,en FROM pairs ORDER BY de,en'):
                def sentence(i):
                    lang,text,user=db.execute('SELECT lang,text,user FROM sentences WHERE id=?',(i,)).fetchone()
                    return {'id':i,'language':lang,'text':text,'contributor':user,'license':'CC-BY-2.0-FR','url':f'https://tatoeba.org/en/sentences/show/{i}'}
                f.write(json.dumps({'german':sentence(deid),'english':sentence(enid),'relationship':'explicit Tatoeba translation link','senseId':None},ensure_ascii=False)+'\n');report['pairs']+=1
        Path(str(out)+'.tmp').replace(out)
    Path(str(out)+'.report.json').write_text(json.dumps(report,indent=2));return report
if __name__=='__main__':print(json.dumps(build(*sys.argv[1:]),indent=2))
