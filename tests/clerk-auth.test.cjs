require('./register.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module'),{randomBytes}=require('node:crypto');
const {createSession}=require('../lib/session.ts');let identity=null,cookie='',store={},revoked=[];
const original=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='@clerk/nextjs/server')return {auth:async()=>({userId:identity?.id||null,sessionId:identity?'session-test':null}),currentUser:async()=>identity,clerkClient:async()=>({sessions:{revokeSession:async id=>revoked.push(id)}})};
 if(request==='next/headers')return {cookies:async()=>({get:()=>({value:cookie})})};
 if(request==='./store' && parent.filename.endsWith('clerk-auth.ts'))return {readValue:async(k,f)=>store[k]??f,updateValue:async(k,f,update)=>store[k]=update(store[k]??f)};
 return original.call(this,request,parent,isMain);
};
const {clerkCustomer,isClerkAdmin,revokeClerkSession}=require('../lib/server/clerk-auth.ts');
const {customerSession}=require('../lib/server/http.ts');Module._load=original;
const user=(email,verified=true)=>({id:'user_google_1',primaryEmailAddressId:'email1',fullName:'Google Shopper',emailAddresses:[{id:'email1',emailAddress:email,verification:{status:verified?'verified':'unverified'}}]});
test('Clerk verifies admin access, preserves customer ownership, and rejects old account cookies',async()=>{
 process.env.NEXT_PUBLIC_AUTH_PROVIDER='clerk';process.env.SESSION_SECRET=randomBytes(32).toString('hex');process.env.APP_SURFACE='admin';process.env.CLERK_ADMIN_EMAILS='owner@example.test';
 identity=user('shopper@example.test');assert.equal(await isClerkAdmin(),false);
 identity=user('owner@example.test',false);assert.equal(await isClerkAdmin(),false);
 identity=user('owner@example.test');assert.equal(await isClerkAdmin(),true);
 process.env.CLERK_ADMIN_EMAILS='';assert.equal(await isClerkAdmin(),false);
 process.env.APP_SURFACE='storefront';process.env.CLERK_ADMIN_EMAILS='owner@example.test';assert.equal(await isClerkAdmin(),false);
 identity=user('shopper@example.test',false);assert.equal(await clerkCustomer(),null);
 const existing={id:'old-customer',email:'shopper@example.test',name:'Shopper',password:'old-hash',phone:'123',address:'Address',city:'City',createdAt:'2026-01-01'};
 store={'9teen_user_accounts':[existing],'9teen_orders':[{id:'old-order',ownerId:'old-customer'},{id:'guest-order',ownerId:'guest:browser1'},{id:'another-order',ownerId:'other-customer'}]};
 cookie=await createSession('customer','guest:browser1');identity=user('shopper@example.test');const profile=await clerkCustomer();
 assert.equal(profile.id,'old-customer');assert.equal(profile.clerkUserId,identity.id);assert.equal(profile.password,undefined);assert.equal(profile.address,'Address');assert.deepEqual(store['9teen_orders'].map(o=>o.ownerId),['old-customer','old-customer','other-customer']);
 assert.equal((await customerSession()).sub,'old-customer');
 await revokeClerkSession();assert.deepEqual(revoked,['session-test']);
 identity=null;cookie=await createSession('customer','old-customer');assert.equal(await customerSession(),null);
 cookie=await createSession('customer','guest:browser2');assert.equal((await customerSession()).sub,'guest:browser2');
 cookie=await createSession('admin','guest:forged-role');assert.equal(await customerSession(),null);
 // An existing Clerk ID wins over an unrelated legacy email match.
 identity=user('new@example.test');store['9teen_user_accounts']=[{...existing,id:'unrelated',email:'new@example.test'},profile];
 assert.equal((await clerkCustomer()).id,'old-customer');
});
