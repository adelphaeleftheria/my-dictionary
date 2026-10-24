// @vitest-environment jsdom
import React from'react';import{render,screen,fireEvent,cleanup}from'@testing-library/react';import{it,expect,vi,afterEach}from'vitest';
vi.mock('../src/search',()=>({manifest:async()=>({accepted:393}),search:async()=>[],entry:async()=>{throw Error('Not found')}}));vi.mock('../src/personal',()=>({all:async()=>[],backup:async()=>'{}',restore:async()=>{},save:async()=>{}}));import{App}from'../src/main';
afterEach(cleanup);
it.each([390,1280])('exposes searchable accessible navigation at viewport %i',async width=>{Object.defineProperty(window,'innerWidth',{value:width,configurable:true});render(<App/>);expect(screen.getByRole('textbox',{name:'Search German or English'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Vocabulary'}));expect(await screen.findByText('Your vocabulary.')).toBeTruthy();expect(screen.getByText('Import JSON')).toBeTruthy();});
