import {openDB} from 'idb';
export interface Personal {id:string;word:string;favorite:boolean;note:string;status:string;list:string;senseNotes:Record<string,string>;createdAt:string;updatedAt:string;viewedAt?:string}
const db=()=>openDB('wortbuch-personal',1,{upgrade(d){d.createObjectStore('words',{keyPath:'id'});}});
export const all=async():Promise<Personal[]> =>(await db()).getAll('words');
export const save=async(p:Personal)=>{await(await db()).put('words',p);};
export async function restore(text:string){const data=JSON.parse(text);if(data.version!==1||!Array.isArray(data.words))throw Error('Expected vocabulary export version 1');for(const p of data.words){if(typeof p.id!=='string'||typeof p.word!=='string'||typeof p.note!=='string'||typeof p.favorite!=='boolean'||typeof p.createdAt!=='string'||typeof p.updatedAt!=='string'||typeof p.status!=='string'||typeof p.list!=='string'||!p.senseNotes||typeof p.senseNotes!=='object')throw Error('Invalid vocabulary record');}const d=await db(),tx=d.transaction('words','readwrite');for(const p of data.words){const old=await tx.store.get(p.id);if(!old||old.updatedAt<p.updatedAt)await tx.store.put(p);}await tx.done;}
export async function backup(){return JSON.stringify({version:1,words:await all()},null,2)}
