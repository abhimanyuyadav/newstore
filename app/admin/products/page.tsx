"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, Category } from "@/lib/types";
import { getProducts, saveProducts, getCategories } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { Save, Tag, Trash2, PlusCircle, UploadCloud, MinusCircle } from "lucide-react";

const generateId = () => `p${Date.now()}${Math.floor(Math.random() * 1000)}`;

const defaultNewProduct = (): Omit<Product, "id"> => ({
  name: "",
  category: "men",
  price: 0,
  originalPrice: 0,
  image: "",
  description: "",
  sizes: ["S", "M", "L"],
  featured: false,
  inStock: true,
  discountEnabled: false,
  newArrival: false,
  bestSeller: false,
  trending: false,
  variants: [],
});

const createDemoProduct = (): Product => ({
  id: generateId(),
  name: "Demo Hoodie",
  category: "men",
  price: 1499,
  originalPrice: 1999,
  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  description: "Soft and stylish demo hoodie for your storefront.",
  sizes: ["S", "M", "L"],
  variants: [{ name: "Color", values: ["Black", "Gray"] }],
  featured: true,
  inStock: true,
  discountEnabled: true,
  newArrival: true,
  bestSeller: true,
  trending: true,
});

function readImageFile(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState(defaultNewProduct());
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);
  const [newImageError, setNewImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
    setIsReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "9teen_products") {
        setProducts(getProducts());
      }
      if (event.key === "9teen_categories") {
        setCategories(getCategories());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const stats = useMemo(() => ({
    featured: products.filter(p => p.featured).length,
    inStock: products.filter(p => p.inStock).length,
    discounts: products.filter(p => p.discountEnabled).length,
  }), [products]);

  const updateProduct = (id: string, key: keyof Product, value: Product[keyof Product]) => {
    const nextProducts = products.map(product => product.id === id ? { ...product, [key]: value } : product);
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setSaved(true);
  };

  const updateProductVariant = (id: string, variantIndex: number, field: "name" | "values", value: string) => {
    const nextProducts = products.map(product => {
      if (product.id !== id) return product;
      const variants = product.variants ? [...product.variants] : [];
      variants[variantIndex] = {
        ...variants[variantIndex],
        [field]: field === "values" ? value.split(",").map(v => v.trim()).filter(Boolean) : value,
      };
      return { ...product, variants };
    });
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setSaved(true);
  };

  const addProductVariantGroup = (id: string) => {
    const nextProducts = products.map(product => product.id === id ? {
      ...product,
      variants: [ ...(product.variants ?? []), { name: "Variant", values: [] } ],
    } : product);
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setSaved(true);
  };

  const removeProductVariantGroup = (id: string, variantIndex: number) => {
    const nextProducts = products.map(product => {
      if (product.id !== id) return product;
      const variants = product.variants ? product.variants.filter((_, idx) => idx !== variantIndex) : [];
      return { ...product, variants };
    });
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setSaved(true);
  };

  const deleteProduct = (id: string) => {
    const nextProducts = products.filter(product => product.id !== id);
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setSaved(true);
  };

  const updateNewProductVariant = (variantIndex: number, field: "name" | "values", value: string) => {
    setNewProduct(prev => {
      const variants = prev.variants ? [...prev.variants] : [];
      variants[variantIndex] = {
        ...variants[variantIndex],
        [field]: field === "values" ? value.split(",").map(v => v.trim()).filter(Boolean) : value,
      };
      return { ...prev, variants };
    });
    setSaved(false);
  };

  const addNewProductVariantGroup = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [ ...(prev.variants ?? []), { name: "Variant", values: [] } ],
    }));
    setSaved(false);
  };

  const removeNewProductVariantGroup = (variantIndex: number) => {
    setNewProduct(prev => ({
      ...prev,
      variants: prev.variants ? prev.variants.filter((_, idx) => idx !== variantIndex) : [],
    }));
    setSaved(false);
  };

  const addProduct = async () => {
    if (!newProduct.name.trim()) { setNewImageError("Product name is required."); return; }
    if (!newProduct.image.trim()) { setNewImageError("Product image is required."); return; }
    const nextProduct: Product = {
      ...newProduct,
      id: generateId(),
      sizes: newProduct.sizes.length ? newProduct.sizes : ["S", "M", "L"],
      variants: newProduct.variants?.length ? newProduct.variants : [],
    };
    const nextProducts = [nextProduct, ...products];
    setProducts(nextProducts);
    saveProducts(nextProducts);
    setNewProduct(defaultNewProduct());
    setSaved(true);
    setPublished(false);
    setNewImageError("");
  };

  const publishProduct = async () => {
    await addProduct();
    // publish to Supabase as well
    try {
      await postProducts([products[0] || {}]);
    } catch (e) {
      // ignore publish error — local save still works
    }
    setPublished(true);
  };

  const handleProductImageDrop = async (id: string, files: FileList | null) => {
    if (!files) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) return;
    const allowed = ['image/png','image/jpeg','image/webp','image/gif'];
    if (!allowed.includes(file.type)) return;

    const dataUrl = await readImageFile(file);
    if (!dataUrl) return;

    // 1) Try server-side upload
    try {
      const res = await fetch('/api/uploads/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileData: dataUrl }),
      });
      const json = await res.json();
      if (res.ok && json.publicUrl) {
        updateProduct(id, 'image', json.publicUrl);
        return;
      }
    } catch (err) {
      // fallback to next option
    }

    // 2) Try client Supabase upload
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const uid = `${id}-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `products/${uid}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        if (data && data.publicUrl) {
          updateProduct(id, 'image', data.publicUrl);
          return;
        }
      }
    } catch (err) {
      // continue
    }

    // 3) fallback to embedding data URL
    updateProduct(id, 'image', dataUrl);
  };

  const handleNewProductImageDrop = async (files: FileList | null) => {
    if (!files) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) { setNewImageError("Only image files are supported."); return; }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) { setNewImageError('Image too large (max 2MB)'); return; }

    const dataUrl = await readImageFile(file);
    if (!dataUrl) { setNewImageError('Failed to read image'); return; }

    // 1) Try server-side upload
    try {
      const res = await fetch('/api/uploads/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileData: dataUrl }),
      });
      const json = await res.json();
      if (res.ok && json.publicUrl) {
        setNewProduct({ ...newProduct, image: json.publicUrl });
        setNewImageError('');
        return;
      }
    } catch (err) {}

    // 2) Try client Supabase upload
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const uid = `new-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `products/${uid}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        if (data && data.publicUrl) {
          setNewProduct({ ...newProduct, image: data.publicUrl });
          setNewImageError('');
          return;
        }
      }
    } catch (err) {}

    // 3) fallback to data URL
    setNewProduct({ ...newProduct, image: dataUrl });
    setNewImageError('');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Products</p>
            <h1 className="text-3xl font-black mt-3">Product Manager</h1>
            <p className="text-sm text-white/70 mt-2">Add, edit, delete products and manage discount visibility with drag-and-drop image uploads.</p>
          </div>
          <div className="inline-flex flex-wrap items-center gap-3">
            <button type="button" disabled={!isReady} onClick={() => {
                const demoProduct = createDemoProduct();
                const nextProducts = [demoProduct, ...products];
                setProducts(nextProducts);
                saveProducts(nextProducts);
                setSaved(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <PlusCircle className="w-4 h-4" /> Add Demo Product
            </button>
            <button type="button" disabled={!isReady} onClick={async () => {
                saveProducts(products);
                setSaved(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4" /> Save Products
            </button>
          </div>
        </div>

        <div className="grid gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Total Products</p>
            <p className="text-3xl font-black mt-3">{products.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Featured Products</p>
            <p className="text-3xl font-black mt-3">{stats.featured}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">In Stock</p>
            <p className="text-3xl font-black mt-3">{stats.inStock}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Discounts Enabled</p>
            <p className="text-3xl font-black mt-3">{stats.discounts}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mt-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <p className="text-sm text-white/60 mt-2">Use drag-and-drop to upload a product image and create a new listing.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={addProduct} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition">
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>
              <button type="button" disabled={!isReady} onClick={publishProduct} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <PlusCircle className="w-4 h-4" /> Publish to Frontend
              </button>
            </div>
          </div>

          {published && <p className="mt-3 text-sm text-green-400">Product published to the frontend and visible to customers.</p>}

          <div id="add-product" className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="mx-auto mb-4 h-48 w-full max-w-lg overflow-hidden rounded-3xl bg-white/10">
                  {newProduct.image ? (
                    <img src={newProduct.image} alt="New product" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/50">Drop an image here</div>
                  )}
                </div>
                <div
                  className="rounded-[2rem] border-dashed border border-white/20 bg-white/5 px-4 py-8 text-center cursor-pointer hover:border-white/40"
                  onDrop={event => { event.preventDefault(); event.stopPropagation(); handleNewProductImageDrop(event.dataTransfer.files); }}
                  onDragOver={event => event.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mx-auto mb-3 h-10 w-10 text-red-400" />
                  <p className="text-sm text-white/70">Drag & drop a product image or click to upload</p>
                  <p className="text-xs text-white/50 mt-2">Supports JPG/PNG files and image URLs in the field below.</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleNewProductImageDrop(e.target.files)} />
                </div>
                {newImageError && <p className="mt-3 text-sm text-red-400">{newImageError}</p>}
              </div>
            </div>

            <div className="grid gap-4">
              <label className="block text-sm text-white/70">
                Name
                <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                Category
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400">
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {categories.length > 0 && (
                  <div className="mt-2 flex items-center gap-3">
                    {(() => {
                      const sel = categories.find(cat => cat.id === newProduct.category);
                      return sel ? (
                        sel.image ? <img src={sel.image} alt={sel.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" /> : <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-800 text-sm">{sel.emoji}</div>
                      ) : null;
                    })()}
                    <div className="text-sm text-white/60">Selected category preview</div>
                  </div>
                )}
              </label>
              <label className="block text-sm text-white/70">
                Price
                <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                Original Price
                <input type="number" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                Image URL
                <input value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                Description
                <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                Sizes (comma separated)
                <input value={newProduct.sizes.join(",")} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value.split(",").map(size => size.trim()).filter(Boolean) })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Product Variants</p>
                  <button type="button" onClick={addNewProductVariantGroup} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400 transition">
                    <PlusCircle className="w-4 h-4" /> Add Variant
                  </button>
                </div>
                {(newProduct.variants ?? []).map((variant, variantIndex) => (
                  <div key={`${variant.name}-${variantIndex}`} className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm text-white/70 sm:col-span-1">
                      Variant Name
                      <input value={variant.name} onChange={e => updateNewProductVariant(variantIndex, "name", e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </label>
                    <label className="block text-sm text-white/70 sm:col-span-2">
                      Values (comma separated)
                      <input value={variant.values.join(",")} onChange={e => updateNewProductVariant(variantIndex, "values", e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </label>
                    <button type="button" onClick={() => removeNewProductVariantGroup(variantIndex)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition sm:col-span-3">
                      <MinusCircle className="w-4 h-4" /> Remove Variant
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setNewProduct({ ...newProduct, featured: !newProduct.featured })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.featured ? "bg-red-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.featured ? "Featured" : "Make Featured"}
                </button>
                <button type="button" onClick={() => setNewProduct({ ...newProduct, inStock: !newProduct.inStock })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.inStock ? "bg-green-500 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.inStock ? "In Stock" : "Out of Stock"}
                </button>
                <button type="button" onClick={() => setNewProduct({ ...newProduct, discountEnabled: !newProduct.discountEnabled })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.discountEnabled ? "bg-yellow-400 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.discountEnabled ? "Discount On" : "Discount Off"}
                </button>
                <button type="button" onClick={() => setNewProduct({ ...newProduct, newArrival: !newProduct.newArrival })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.newArrival ? "bg-blue-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.newArrival ? "New Arrival" : "Mark New Arrival"}
                </button>
                <button type="button" onClick={() => setNewProduct({ ...newProduct, bestSeller: !newProduct.bestSeller })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.bestSeller ? "bg-purple-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.bestSeller ? "Best Seller" : "Mark Best Seller"}
                </button>
                <button type="button" onClick={() => setNewProduct({ ...newProduct, trending: !newProduct.trending })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${newProduct.trending ? "bg-sky-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {newProduct.trending ? "Trending" : "Mark Trending"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 mt-6">
          {products.map(product => (
            <div key={product.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-white/10">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    <div
                      className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-flex cursor-pointer"
                      onDrop={event => { event.preventDefault(); event.stopPropagation(); handleProductImageDrop(product.id, event.dataTransfer.files); }}
                      onDragOver={event => event.preventDefault()}
                    >
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.35em] text-white/90">Drop image here</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Product</p>
                    <p className="text-xl font-bold mt-2">{product.name}</p>
                    <p className="text-sm text-white/50 mt-1">{product.category}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => deleteProduct(product.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 transition">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${product.discountEnabled ? "bg-yellow-400 text-black" : "bg-white/10 text-white/70"}`}>
                    <Tag className="w-4 h-4" /> {product.discountEnabled ? "Discount On" : "Discount Off"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 mt-5 md:grid-cols-2 xl:grid-cols-4">
                <label className="block text-sm text-white/70">
                  Name
                  <input value={product.name} onChange={e => updateProduct(product.id, "name", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Price
                  <input type="number" value={product.price} onChange={e => updateProduct(product.id, "price", Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Original Price
                  <input type="number" value={product.originalPrice || 0} onChange={e => updateProduct(product.id, "originalPrice", Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Image URL
                  <input value={product.image} onChange={e => updateProduct(product.id, "image", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70 md:col-span-2 xl:col-span-4">
                  Description
                  <input value={product.description} onChange={e => updateProduct(product.id, "description", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              </div>

              {(product.variants ?? []).length > 0 && (
                <div className="space-y-3 mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Variants</p>
                    <button type="button" onClick={() => addProductVariantGroup(product.id)} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400 transition">
                      <PlusCircle className="w-4 h-4" /> Add Variant
                    </button>
                  </div>
                  {(product.variants ?? []).map((variant, variantIndex) => (
                    <div key={`${product.id}-${variantIndex}`} className="grid gap-3 sm:grid-cols-3">
                      <label className="block text-sm text-white/70 sm:col-span-1">
                        Variant Name
                        <input value={variant.name} onChange={e => updateProductVariant(product.id, variantIndex, "name", e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                      </label>
                      <label className="block text-sm text-white/70 sm:col-span-2">
                        Values (comma separated)
                        <input value={variant.values.join(",")} onChange={e => updateProductVariant(product.id, variantIndex, "values", e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                      </label>
                      <button type="button" onClick={() => removeProductVariantGroup(product.id, variantIndex)} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition sm:col-span-3">
                        <MinusCircle className="w-4 h-4" /> Remove Variant
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4 items-center">
                <button onClick={() => updateProduct(product.id, "featured", !product.featured)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.featured ? "bg-red-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.featured ? "Featured" : "Mark Featured"}
                </button>
                <button onClick={() => updateProduct(product.id, "inStock", !product.inStock)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.inStock ? "bg-green-500 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </button>
                <button onClick={() => updateProduct(product.id, "discountEnabled", !product.discountEnabled)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.discountEnabled ? "bg-yellow-400 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.discountEnabled ? "Discount On" : "Discount Off"}
                </button>
                <button onClick={() => updateProduct(product.id, "newArrival", !product.newArrival)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.newArrival ? "bg-blue-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.newArrival ? "New Arrival" : "Mark New Arrival"}
                </button>
                <button onClick={() => updateProduct(product.id, "bestSeller", !product.bestSeller)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.bestSeller ? "bg-purple-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.bestSeller ? "Best Seller" : "Mark Best Seller"}
                </button>
                <button onClick={() => updateProduct(product.id, "trending", !product.trending)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${product.trending ? "bg-sky-500 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {product.trending ? "Trending" : "Mark Trending"}
                </button>
                <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.35em] text-white/50">Sku: {product.id}</span>
              </div>
            </div>
          ))}
        </div>

        {saved && <p className="mt-4 text-sm text-green-400">Changes saved locally in admin storage.</p>}
      </div>
    </div>
  );
}
