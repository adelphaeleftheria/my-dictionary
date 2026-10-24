import {createReadStream} from 'node:fs';
import {mkdir,writeFile,readFile,rename,rm} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {normalize,type Entry,type Provenance} from '../src/model';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export function convert(r:any,source:Provenance,edition:'en'|'de'='en'):Entry|null {
 if(r.lang_code!=='de')return null;
 if(typeof r.word!=='string'||typeof r.pos!=='string'||!Array.isArray(r.senses))throw Error('Expected word, pos, senses: source schema changed');
 const identity=JSON.stringify([r.word,r.pos,r.etymology_number||0]);const id=hash(identity).slice(0,24);const provenance={...source,url:`https://${edition}.wiktionary.org/wiki/${encodeURIComponent(r.word)}`,record:r.word+'#'+r.pos+':'+(r.etymology_number||0)};
 const senses=r.senses.map((s:any,i:number)=>{if(s.glosses&&!Array.isArray(s.glosses))throw Error('Invalid glosses');const index=s.sense_index||s.senseid||String(i+1);return {id:id+':'+index,glosses:s.glosses||[],translations:[...(s.translations||[]),...(r.translations||[]).filter((t:any)=>String(t.sense_index)===String(s.sense_index)&&s.sense_index)].filter((t:any)=>t.lang_code==='en').map((t:any)=>t.word),labels:[...(s.tags||[]),...(s.topics||[])],examples:(s.examples||[]).filter((x:any)=>typeof x.text==='string'&&x.type==='example').map((x:any)=>({text:x.text,english:x.english,provenance})),related:['synonyms','antonyms','related','derived','coordinate_terms'].flatMap(k=>(s[k]||[]).map((x:any)=>k+': '+x.word)),provenance};});
 return {id,word:r.word,pos:r.pos,tags:[...new Set([...(r.tags||[]),...['masculine','feminine','neuter','separable','strong','weak'].filter(t=>r.senses.length&&r.senses.every((s:any)=>(s.tags||[]).includes(t)))])],ipa:(r.sounds||[]).filter((x:any)=>x.ipa).map((x:any)=>x.ipa),forms:(r.forms||[]).filter((x:any,i:number,a:any[])=>a.findIndex(y=>JSON.stringify(y)===JSON.stringify(x))===i).filter((x:any)=>typeof x.form==='string'&&!(x.tags||[]).some((t:string)=>['table-tags','inflection-template','class'].includes(t))).map((x:any)=>({form:x.form,tags:x.tags||[]})),senses,provenance,raw:r};
}
export async function build(input:string,metadata:string,out='public/data',edition:'en'|'de'='en') {
 const source=JSON.parse(await readFile(metadata,'utf8'));if(!source.license||!source.url||!source.source||!source.reviewedAt)throw Error('Source manifest requires reviewed license, URL, name, reviewedAt');
 const temp=out+'.building';await rm(temp,{recursive:true,force:true});await mkdir(temp+'/entries',{recursive:true});await mkdir(temp+'/shards',{recursive:true});
 const seen=new Set<string>();const usedIds=new Set<string>();const digest=createHash('sha256');let accepted=0,rejected=0,duplicates=0,missingTranslation=0,examples=0;const errors:string[]=[];let line=0;const shards=new Map<string,Entry[]>();const postings=new Map<string,Set<string>>();const lexicon:{id:string;word:string;pos:string}[]=[];
 for await(const text of createInterface({input:createReadStream(input),crlfDelay:Infinity})) {line++;digest.update(text+'\n');if(!text.trim())continue;try {const entry=convert(JSON.parse(text),source,edition);if(!entry)continue;const fingerprint=hash(JSON.stringify(entry.raw));if(seen.has(fingerprint)){duplicates++;continue;}seen.add(fingerprint);
 // Keep different records distinct even if upstream repeats a lemma/POS/etymology key.
 if(usedIds.has(entry.id))entry.id+='-'+fingerprint.slice(0,12);usedIds.add(entry.id);entry.senses.forEach(s=>s.id=entry.id+':'+s.id.split(':').slice(1).join(':'));
 await writeFile(`${temp}/entries/${entry.id}.json`,JSON.stringify(entry));const shard=entry.id.slice(0,2);const list=shards.get(shard)||[];const compact={...entry,raw:{},provenance:{} as Provenance};list.push(compact);shards.set(shard,list);const searchable=normalize([entry.word,...entry.forms.map(f=>f.form),...entry.senses.flatMap(s=>[...s.translations,...s.glosses,...s.examples.map(e=>e.text+' '+(e.english||''))])].join(' '));for(let i=0;i<searchable.length;i++)for(let n=1;n<=3&&i+n<=searchable.length;n++){const gram=searchable.slice(i,i+n);const ids=postings.get(gram)||new Set<string>();ids.add(entry.id);postings.set(gram,ids);}lexicon.push({id:entry.id,word:entry.word,pos:entry.pos});accepted++;if(edition==='de'&&!entry.senses.some(s=>s.translations.length))missingTranslation++;examples+=entry.senses.reduce((n,s)=>n+s.examples.length,0);
 }catch(e){rejected++;if(errors.length<100)errors.push(`line ${line}: ${String(e)}`);}}
 if(!accepted)throw Error('No German records accepted; existing dataset preserved');
 for(const [key,values]of shards)await writeFile(`${temp}/shards/${key}.json`,JSON.stringify(values));
 await mkdir(temp+'/index',{recursive:true});const grams:Record<string,number>={};for(const [gram,ids]of postings){const key=Buffer.from(gram).toString('hex');grams[gram]=ids.size;await writeFile(temp+'/index/'+key+'.json',JSON.stringify([...ids]));}
 await writeFile(temp+'/lexicon.json',JSON.stringify(lexicon));
 const report={grams,accepted,rejected,duplicates,missingTranslation,examples,errors,inputSha256:digest.digest('hex'),builtAt:new Date().toISOString(),source,edition,shards:[...shards.keys()].sort()};await writeFile(temp+'/manifest.json',JSON.stringify(report,null,2));
 if(rejected)throw Error(`${rejected} rejected records; inspect ${temp}/manifest.json. Existing dataset preserved.`);
 await rm(out+'.previous',{recursive:true,force:true});try{await rename(out,out+'.previous')}catch(e:any){if(e.code!=='ENOENT')throw e;}await rename(temp,out);console.log(JSON.stringify({accepted,rejected,duplicates,missingTranslation,examples},null,2));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const [input,metadata,out,edition]=process.argv.slice(2);if(!input||!metadata)throw Error('Usage: npm run import -- input.jsonl source.json [public/data] [en|de]');await build(input,metadata,out,edition as 'en'|'de');}
