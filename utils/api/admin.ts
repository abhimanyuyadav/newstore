export async function postProducts(products: any[]) {
  return fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products),
  }).then(r => r.json()).catch(err => ({ error: err?.message || String(err) }));
}

export async function postOrders(orders: any[]) {
  return fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orders),
  }).then(r => r.json()).catch(err => ({ error: err?.message || String(err) }));
}

export async function postUsers(users: any[]) {
  return fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(users),
  }).then(r => r.json()).catch(err => ({ error: err?.message || String(err) }));
}

export async function migrateAll(payload: { products?: any[]; orders?: any[]; users?: any[] }) {
  const results: any = {};
  try {
    results.products = payload.products ? await postProducts(payload.products) : { skipped: true };
  } catch (e) { results.products = { error: (e as Error).message }; }
  try {
    results.orders = payload.orders ? await postOrders(payload.orders) : { skipped: true };
  } catch (e) { results.orders = { error: (e as Error).message }; }
  try {
    results.users = payload.users ? await postUsers(payload.users) : { skipped: true };
  } catch (e) { results.users = { error: (e as Error).message }; }
  return results;
}
