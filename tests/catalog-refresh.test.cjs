require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {refreshSharedData,saveProducts,getProducts}=require('../lib/data.ts');
test('catalog refresh loads saved edits but never overwrites a newer local save',async()=>{
  const original=global.fetch;
  try {
    global.fetch=async()=>({ok:true,json:async()=>({'9teen_products':[{id:'a',name:'Saved edit'}]})});
    await refreshSharedData();
    assert.equal(getProducts()[0].name,'Saved edit');
    let release,started;
    const reading=new Promise(r=>started=r);
    global.fetch=async(_url,init)=>{
      if(init?.method==='POST') return {ok:true,json:async()=>({ok:true})};
      started();
      return new Promise(resolve=>{release=()=>resolve({ok:true,json:async()=>({'9teen_products':[{id:'a',name:'Old snapshot'}]})});});
    };
    const refresh=refreshSharedData();
    await reading;
    await saveProducts([{id:'a',name:'Newer edit'}]);
    release(); await refresh;
    assert.equal(getProducts()[0].name,'Newer edit');
  } finally {global.fetch=original;}
});
