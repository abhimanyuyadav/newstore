const { test,before,after }=require("node:test");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {once}=require("node:events");
const fs=require("node:fs/promises"),os=require("node:os"),path=require("node:path"),net=require("node:net");
const {randomBytes,randomUUID}=require("node:crypto");
let server,base,directory,output="";
const adminPassword=randomBytes(24).toString("hex");
function client() {
  let cookie="";
  return async (route,method="GET",body,headers={})=>{
    const r=await fetch(base+route,{method,headers:{origin:base,...body!==undefined?{"Content-Type":"application/json"}:{},...cookie?{cookie}:{},...headers},body:body===undefined?undefined:JSON.stringify(body),redirect:"manual"});
    for(const set of r.headers.getSetCookie()) { const pair=set.split(";")[0];const name=pair.split("=")[0];cookie=cookie.split("; ").filter(x=>x && !x.startsWith(name+"=")).concat(pair).join("; "); }
    const text=await r.text(); let data;try{data=JSON.parse(text)}catch{data=text}
    return {status:r.status,data,headers:r.headers};
  };
}
before(async()=>{
  directory=await fs.mkdtemp(path.join(os.tmpdir(),"newstore-tests-"));
  const listener=net.createServer();listener.listen(0,"127.0.0.1");await once(listener,"listening");const port=listener.address().port;await new Promise(r=>listener.close(r));base="http://127.0.0.1:"+port;
  server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{cwd:path.resolve(__dirname,".."),windowsHide:true,env:{...process.env,NODE_ENV:"production",STORE_BACKEND:"local",STORE_FILE:path.join(directory,"store.json"),SESSION_SECRET:randomBytes(32).toString("hex"),ADMIN_USERNAME:"test-admin",ADMIN_PASSWORD:adminPassword,ESEWA_SECRET_KEY:"",ESEWA_PRODUCT_CODE:"",NEXT_PUBLIC_SUPABASE_URL:"",SUPABASE_SERVICE_ROLE_KEY:"",NEXT_PUBLIC_CONVEX_URL:""}});
  server.stdout.on("data",d=>output+=d);server.stderr.on("data",d=>output+=d);
  for(let i=0;i<120;i++){if(server.exitCode!==null)throw new Error(output);try{await fetch(base+"/api/auth/admin");return;}catch{await new Promise(r=>setTimeout(r,250));}}
  throw new Error("Test server did not start: "+output);
},{timeout:45000});
after(async()=>{if(server && server.exitCode===null){server.kill();await once(server,"exit");}if(directory)await fs.rm(directory,{recursive:true,force:true});});
test("store boundaries, checkout, and account isolation",async()=>{
  const admin=client(),alice=client(),bob=client();
  assert.equal((await alice("/api/auth/admin")).data.authenticated,false);
  assert.equal((await alice("/api/storage","POST",{key:"9teen_products",value:[]})).status,401);
  assert.equal((await alice("/api/storage?key=9teen_user_accounts")).status,403);
  assert.equal((await alice("/api/users")).status,401);
  assert.equal((await alice("/api/uploads/product","POST",{})).status,401);
  assert.equal((await alice("/api/auth/admin","GET",undefined,{cookie:"admin_session=1"})).data.authenticated,false);
  assert.equal((await alice("/admin/dashboard","GET",undefined,{cookie:"admin_session=1"})).status,307);
  assert.equal((await admin("/api/auth/admin","POST",{username:"test-admin",password:adminPassword})).status,200);
  assert.equal((await admin("/api/storage","POST",{key:"9teen_products",value:[]},{origin:"https://unrelated.invalid"})).status,403);
  const product={id:"test-product",name:"Test Product",image:"/favicon.svg",category:"men",price:250,sizes:["M"],featured:false,inStock:true,newArrival:false,bestSeller:false,trending:false,description:"test"};
  assert.equal((await admin("/api/storage","POST",{key:"9teen_products",value:[]})).status,200);
  assert.deepEqual((await alice("/api/products")).data,[]);
  assert.equal((await admin("/api/products","POST",[product])).status,200);
  await admin("/api/products","POST",[{...product,id:"second"}]);
  assert.equal((await alice("/api/products")).data.length,2);
  await admin("/api/storage","POST",{key:"9teen_site_settings",value:{siteName:"Test Store",adminUsername:"hidden",adminPassword:"never-public",esewaEnabled:true}});
  const publicStore=(await alice("/api/storage")).data;
  assert.equal(publicStore["9teen_site_settings"].adminPassword,undefined);
  assert.equal(publicStore["9teen_site_settings"].esewaEnabled,false);
  await alice("/api/orders");await bob("/api/orders");
  const body={requestId:randomUUID(),items:[{id:product.id,size:"M",quantity:2,price:1}],customer:{name:"Alice Test",phone:"9800000000",email:"alice@example.test",address:"Test address",city:"Test city"},paymentMethod:"whatsapp",paymentStatus:"paid",total:2};
  const created=await alice("/api/orders","POST",body);
  assert.equal(created.status,201,JSON.stringify(created.data));assert.equal(created.data.total,500);assert.equal(created.data.paymentStatus,"pending");
  assert.equal((await alice("/api/orders","POST",body)).data.id,created.data.id);
  assert.equal((await bob("/api/orders")).data.length,0);
  assert.equal((await alice("/api/orders")).data.length,1);
  assert.equal((await alice("/api/orders","POST",{...body,requestId:randomUUID(),items:[{id:product.id,size:"M",quantity:-2}]})).status,400);
  assert.equal((await alice("/api/orders","POST",{...body,requestId:randomUUID(),paymentMethod:"esewa"})).status,503);
  assert.equal((await alice("/api/esewa/verify","POST",{orderId:created.data.id})).status,404);
  assert.equal((await admin("/api/orders","PATCH",[{id:created.data.id,status:"shipped",paymentStatus:"paid",total:0}])).status,200);
  const updated=(await alice("/api/orders")).data[0];assert.equal(updated.status,"shipped");assert.equal(updated.total,500);assert.equal(updated.paymentStatus,"pending");
  assert.equal((await alice("/api/reviews","POST",{productId:product.id,name:"Test reviewer",rating:5,comment:"Test comment",status:"approved"})).status,201);
  assert.deepEqual((await alice("/api/storage?key=9teen_reviews")).data,[]);
  const registered=await alice("/api/auth/customer","POST",{action:"register",name:"Alice Test",email:"alice@example.test",password:"test-password-123",phone:"9800000000",address:"Test address",city:"Test city"});
  assert.equal(registered.status,200);assert.equal(registered.data.password,undefined);
  assert.equal((await bob("/api/auth/customer")).data,null);
  assert.equal((await alice("/api/auth/customer")).data.email,"alice@example.test");
  assert.equal((await alice("/api/orders")).data.length,1,"Guest checkout history follows its owner after registration");
  await alice("/api/auth/customer","DELETE");assert.equal((await alice("/api/auth/customer")).data,null);
  assert.equal((await alice("/api/auth/customer","POST",{action:"login",email:"alice@example.test",password:"incorrect"})).status,401);
  assert.equal((await alice("/api/auth/customer","POST",{action:"login",email:"alice@example.test",password:"test-password-123"})).status,200);
  const accounts=(await admin("/api/users")).data;assert.equal(accounts.length,1);assert.equal(accounts[0].password,undefined);
  await admin("/api/auth/admin","DELETE");
  assert.equal((await admin("/api/storage","POST",{key:"9teen_products",value:[]})).status,401);
},{timeout:45000});
