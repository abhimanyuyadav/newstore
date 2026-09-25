const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{once}=require('node:events'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{randomBytes}=require('node:crypto');
test('separate admin host shares catalog while storefront rejects admin sessions', {timeout:90000},async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'newstore-surfaces-')),children=[];const secret=randomBytes(32).toString('hex'),password=randomBytes(24).toString('hex');
 async function start(surface,adminUrl=''){
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));const base='http://127.0.0.1:'+port;
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,env:{...process.env,NODE_ENV:'production',APP_SURFACE:surface,ADMIN_APP_URL:adminUrl,NEXT_PUBLIC_BASE_URL:base,STORE_BACKEND:'local',STORE_FILE:path.join(dir,'store.json'),SESSION_SECRET:secret,ADMIN_USERNAME:'test-admin',ADMIN_PASSWORD:password}});children.push(child);let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  for(let i=0;i<120;i++){if(child.exitCode!==null)throw Error(output);try{await fetch(base+'/api/auth/admin');return base}catch{await new Promise(r=>setTimeout(r,250))}}throw Error('Server startup failed');
 }
 try{
  const admin=await start('admin'),store=await start('storefront',admin);
  const req=(base,route,method='GET',body,cookie='')=>fetch(base+route,{method,redirect:'manual',headers:{origin:base,'Content-Type':'application/json',cookie},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal(new URL((await req(admin,'/')).headers.get('location')).pathname,'/admin');assert.equal((await req(admin,'/products')).status,404);
  assert.equal((await req(store,'/admin/products')).headers.get('location'),admin+'/admin/products');assert.equal(new URL((await req(admin,'/admin/products')).headers.get('location')).pathname,'/admin');
  const login=await req(admin,'/api/auth/admin','POST',{username:'test-admin',password});assert.equal(login.status,200);const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
  assert.equal((await req(admin,'/admin/products','GET',undefined,cookie)).status,200);
  assert.equal((await req(store,'/api/auth/admin','POST',{username:'test-admin',password})).status,404);
  assert.equal((await (await req(store,'/api/auth/admin','GET',undefined,cookie)).json()).authenticated,false);
  const value=[{id:'separated',name:'Saved on admin host',image:'/favicon.svg',price:200,sizes:['M']}];
  assert.equal((await req(admin,'/api/storage','POST',{key:'9teen_products',value},cookie)).status,200);
  assert.deepEqual(await (await req(store,'/api/products')).json(),value);
  assert.equal((await req(store,'/api/storage','POST',{key:'9teen_products',value:[]},cookie)).status,401);
  assert.equal((await req(admin,'/api/storage','POST',{key:'9teen_products',value:[]})).status,401);
 }finally{for(const child of children){if(child.exitCode===null){child.kill();await once(child,'exit')}}if(path.dirname(dir)===path.resolve(os.tmpdir())&&path.basename(dir).startsWith('newstore-surfaces-'))await fs.rm(dir,{recursive:true,force:true});}
});
