require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {reconcilePublicCatalog}=require('../lib/public-catalog.ts');
const catalog={products:[{id:'p',price:2500}],categories:[{id:'dresses',enabled:true}],settings:{heroTitle:'Collection'},reviews:[{id:'r',comment:'Nice'}]};
test('identical catalog refresh keeps context identity',()=>{
  assert.equal(reconcilePublicCatalog(catalog, structuredClone(catalog)),catalog);
});
test('price, availability, settings and review edits reach catalog subscribers',()=>{
  for(const edit of [c=>c.products[0].price=2400,c=>c.categories[0].enabled=false,c=>c.settings.heroTitle='New collection',c=>c.reviews=[]]) {
    const next=structuredClone(catalog);edit(next);
    assert.equal(reconcilePublicCatalog(catalog,next),next);
  }
});
