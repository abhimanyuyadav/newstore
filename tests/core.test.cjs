require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
process.env.SESSION_SECRET = randomBytes(32).toString("hex");
const { createSession,verifySession } = require("../lib/session.ts");
const { hashPassword,verifyPassword } = require("../lib/server/auth.ts");
const { reducer,calcTotals } = require("../components/CartContext.tsx");
const { signature } = require("../lib/server/esewa.ts");
const { weeklySales } = require("../lib/analytics.ts");
test("weekly sales exclude unpaid, cancelled, and old orders", () => {
  const now = new Date(2026, 8, 25, 12);
  const order = { paymentStatus: "paid", status: "delivered", total: 250, createdAt: now.toISOString() };
  const results = weeklySales([order, { ...order, paymentStatus: "pending" }, { ...order, status: "cancelled" }, { ...order, createdAt: new Date(2026, 8, 1).toISOString() }], now);
  assert.equal(results.length, 7);
  assert.equal(results[6].amount, 250);
  assert.equal(results.slice(0, 6).reduce((n, d) => n + d.amount, 0), 0);
});
test("signed sessions reject forged, malformed, expired, and modified tokens",async()=>{
  const token=await createSession("admin","test-admin");
  assert.equal((await verifySession(token)).role,"admin");
  assert.equal(await verifySession("1"),null);
  assert.equal(await verifySession("bad.payload"),null);
  const [payload,sig]=token.split(".");
  const changed=Buffer.from(JSON.stringify({...JSON.parse(Buffer.from(payload,"base64url")),sub:"other"})).toString("base64url");
  assert.equal(await verifySession(changed+"."+sig),null);
  const realNow=Date.now;
  try { Date.now=()=>realNow()+90000000;assert.equal(await verifySession(token),null); } finally { Date.now=realNow; }
});
test("passwords use salted scrypt and never accept legacy demo hashes",async()=>{
  const one=await hashPassword("Example-test-password"),two=await hashPassword("Example-test-password");
  assert.notEqual(one,two);
  assert.equal(await verifyPassword("Example-test-password",one),true);
  assert.equal(await verifyPassword("wrong-password",one),false);
  assert.equal(await verifyPassword("anything","abcd123"),false);
});
test("cart quantities are bounded and variants remain independent",()=>{
  const item={id:"p",name:"Product",price:125,size:"M",quantity:1,image:"/image.png",variantSelections:{Color:"Black"}};
  let state=reducer({items:[]},{type:"ADD",item});
  state=reducer(state,{type:"ADD",item:{...item,variantSelections:{Color:"White"}}});
  assert.equal(state.items.length,2);
  state=reducer(state,{type:"UPDATE_QTY",id:"p",size:"M",variantSelections:{Color:"Black"},qty:-1});
  assert.equal(state.items[0].quantity,1);
  assert.equal(calcTotals(state.items).total,250);
  state=reducer(state,{type:"REMOVE",id:"p",size:"M",variantSelections:{Color:"White"}});
  assert.equal(state.items.length,1);
  assert.equal(reducer(state,{type:"ADD",item:{...item,quantity:NaN}}),state);
});
test("payment signing matches the RFC 4231 HMAC-SHA256 test vector",()=>{
  const expected = Buffer.from("5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843", "hex").toString("base64");
  assert.equal(signature("what do ya want for nothing?","Jefe"), expected);
});
