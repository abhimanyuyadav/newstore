"use client";
import { useEffect, useRef, useState } from "react";
import { getSiteSettings, saveSiteSettings, resetProducts, resetSiteSettings, resetOrders, resetCategories, resetAllData } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { Save, Image, MessageCircle, Trash2, UploadCloud, RefreshCcw } from "lucide-react";

export default function AdminSettingsPage() {
  const settings = getSiteSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [heroTopLabel, setHeroTopLabel] = useState(settings.heroTopLabel);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroHighlight, setHeroHighlight] = useState(settings.heroHighlight);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle);
  const [heroImage, setHeroImage] = useState(settings.heroImage);
  const [esewaEnabled, setEsewaEnabled] = useState(settings.esewaEnabled ?? true);
  const [esewaLabel, setEsewaLabel] = useState(settings.esewaLabel || "eSewa");
  const [esewaTitle, setEsewaTitle] = useState(settings.esewaTitle || "Pay with eSewa");
  const [esewaDescription, setEsewaDescription] = useState(settings.esewaDescription || "Scan this QR in your eSewa app to pay faster.");
  const [esewaButtonLabel, setEsewaButtonLabel] = useState(settings.esewaButtonLabel || "Pay with eSewa");
  const [esewaQrImage, setEsewaQrImage] = useState(settings.esewaQrImage || "");
  const [heroButtonLabel, setHeroButtonLabel] = useState(settings.heroButtonLabel);
  const [heroExploreButtonLabel, setHeroExploreButtonLabel] = useState(settings.heroExploreButtonLabel);
  const [navLabelShop, setNavLabelShop] = useState(settings.navLabelShop);
  const [navLabelCategories, setNavLabelCategories] = useState(settings.navLabelCategories);
  const [navLabelCollections, setNavLabelCollections] = useState(settings.navLabelCollections);
  const [navLabelTrackOrder, setNavLabelTrackOrder] = useState(settings.navLabelTrackOrder);
  const [navLabelAbout, setNavLabelAbout] = useState(settings.navLabelAbout);
  const [navLabelLogin, setNavLabelLogin] = useState(settings.navLabelLogin);
  const [promoText, setPromoText] = useState(settings.promoText);
  const [searchPlaceholder, setSearchPlaceholder] = useState(settings.searchPlaceholder);
  const [sectionShopByCategoryLabel, setSectionShopByCategoryLabel] = useState(settings.sectionShopByCategoryLabel);
  const [sectionShopByCategoryTitle, setSectionShopByCategoryTitle] = useState(settings.sectionShopByCategoryTitle);
  const [sectionProductsEnabled, setSectionProductsEnabled] = useState(settings.sectionProductsEnabled);
  const [sectionProductsLabel, setSectionProductsLabel] = useState(settings.sectionProductsLabel);
  const [sectionProductsTitle, setSectionProductsTitle] = useState(settings.sectionProductsTitle);
  const [sectionOrder, setSectionOrder] = useState(settings.sectionOrder || ["shopByCategory", "products", "newArrivals", "bestSellers", "trending", "featured", "sale", "specialOffer"]);
  const [sectionNewArrivalsEnabled, setSectionNewArrivalsEnabled] = useState(settings.sectionNewArrivalsEnabled);
  const [sectionNewArrivalsLabel, setSectionNewArrivalsLabel] = useState(settings.sectionNewArrivalsLabel);
  const [sectionNewArrivalsTitle, setSectionNewArrivalsTitle] = useState(settings.sectionNewArrivalsTitle);
  const [sectionBestSellersEnabled, setSectionBestSellersEnabled] = useState(settings.sectionBestSellersEnabled);
  const [sectionBestSellersLabel, setSectionBestSellersLabel] = useState(settings.sectionBestSellersLabel);
  const [sectionBestSellersTitle, setSectionBestSellersTitle] = useState(settings.sectionBestSellersTitle);
  const [sectionTrendingEnabled, setSectionTrendingEnabled] = useState(settings.sectionTrendingEnabled);
  const [sectionTrendingLabel, setSectionTrendingLabel] = useState(settings.sectionTrendingLabel);
  const [sectionTrendingTitle, setSectionTrendingTitle] = useState(settings.sectionTrendingTitle);
  const [sectionFeaturedEnabled, setSectionFeaturedEnabled] = useState(settings.sectionFeaturedEnabled);
  const [sectionFeaturedLabel, setSectionFeaturedLabel] = useState(settings.sectionFeaturedLabel);
  const [sectionFeaturedTitle, setSectionFeaturedTitle] = useState(settings.sectionFeaturedTitle);
  const [sectionSaleEnabled, setSectionSaleEnabled] = useState(settings.sectionSaleEnabled);
  const [sectionSaleLabel, setSectionSaleLabel] = useState(settings.sectionSaleLabel);
  const [sectionSaleTitle, setSectionSaleTitle] = useState(settings.sectionSaleTitle);
  const [sectionSpecialOfferEnabled, setSectionSpecialOfferEnabled] = useState(settings.sectionSpecialOfferEnabled);
  const [sectionSpecialOfferLabel, setSectionSpecialOfferLabel] = useState(settings.sectionSpecialOfferLabel);
  const [sectionSpecialOfferTitle, setSectionSpecialOfferTitle] = useState(settings.sectionSpecialOfferTitle);
  const [sectionSpecialOfferButtonLabel, setSectionSpecialOfferButtonLabel] = useState(settings.sectionSpecialOfferButtonLabel);
  const [sectionToAdd, setSectionToAdd] = useState("");
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername);
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword);
  const [footerContactEmail, setFooterContactEmail] = useState(settings.footerContactEmail);
  const [footerContactPhone, setFooterContactPhone] = useState(settings.footerContactPhone);
  const [footerContactLocation, setFooterContactLocation] = useState(settings.footerContactLocation);
  const [footerDeveloperText, setFooterDeveloperText] = useState(settings.footerDeveloperText);
  const [footerDeveloperLink, setFooterDeveloperLink] = useState(settings.footerDeveloperLink);
  const [footerDeveloperLinkLabel, setFooterDeveloperLinkLabel] = useState(settings.footerDeveloperLinkLabel);
  const [footerMiddleText, setFooterMiddleText] = useState(settings.footerMiddleText);
  const [footerWhatsAppButtonLabel, setFooterWhatsAppButtonLabel] = useState(settings.footerWhatsAppButtonLabel);
  const [footerUpdatedDate, setFooterUpdatedDate] = useState(settings.footerUpdatedDate);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappMessage, setWhatsappMessage] = useState(settings.whatsappMessage);
  const [notificationEmail, setNotificationEmail] = useState(settings.notificationEmail);
  const [emailSubject, setEmailSubject] = useState(settings.emailSubject);
  const [emailBody, setEmailBody] = useState(settings.emailBody);
  const [designImages, setDesignImages] = useState<string[]>(settings.designImages || []);
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const readFileToDataUrl = async (file: File) => {
    if (!file.type.startsWith("image/")) return null;
    const reader = new FileReader();
    return await new Promise<string | null>(resolve => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleHeroImageUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const dataUrl = await readFileToDataUrl(files[0]);
    if (dataUrl) setHeroImage(dataUrl);
  };

  const handleQrUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const dataUrl = await readFileToDataUrl(files[0]);
    if (dataUrl) setEsewaQrImage(dataUrl);
  };

  const handleDesignImages = async (files: FileList | null) => {
    if (!files) return;
    const results: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readFileToDataUrl(file);
      if (dataUrl) results.push(dataUrl);
    }
    if (results.length > 0) setDesignImages(prev => [...prev, ...results]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleDesignImages(event.dataTransfer.files);
  };

  const buildSettingsPayload = () => ({
    siteName,
    tagline,
    heroTopLabel,
    heroTitle,
    heroHighlight,
    heroSubtitle,
    heroImage,
    heroButtonLabel,
    heroExploreButtonLabel,
    navLabelShop,
    navLabelCategories,
    navLabelCollections,
    navLabelTrackOrder,
    navLabelAbout,
    navLabelLogin,
    promoText,
    searchPlaceholder,
    sectionShopByCategoryLabel,
    sectionShopByCategoryTitle,
    sectionProductsEnabled,
    sectionProductsLabel,
    sectionProductsTitle,
    sectionOrder,
    sectionNewArrivalsEnabled,
    sectionNewArrivalsLabel,
    sectionNewArrivalsTitle,
    sectionBestSellersEnabled,
    sectionBestSellersLabel,
    sectionBestSellersTitle,
    sectionTrendingEnabled,
    sectionTrendingLabel,
    sectionTrendingTitle,
    sectionFeaturedEnabled,
    sectionFeaturedLabel,
    sectionFeaturedTitle,
    sectionSaleEnabled,
    sectionSaleLabel,
    sectionSaleTitle,
    sectionSpecialOfferEnabled,
    sectionSpecialOfferLabel,
    sectionSpecialOfferTitle,
    sectionSpecialOfferButtonLabel,
    adminUsername,
    adminPassword,
    footerContactEmail,
    footerContactPhone,
    footerContactLocation,
    footerDeveloperText,
    footerDeveloperLink,
    footerDeveloperLinkLabel,
    footerMiddleText,
    footerWhatsAppButtonLabel,
    footerUpdatedDate,
    esewaEnabled,
    esewaLabel,
    esewaTitle,
    esewaDescription,
    esewaButtonLabel,
    esewaQrImage,
    whatsappNumber,
    whatsappMessage,
    notificationEmail,
    emailSubject,
    emailBody,
    designImages,
  });

  useEffect(() => {
    saveSiteSettings(buildSettingsPayload());
  }, [
    siteName,
    tagline,
    heroTopLabel,
    heroTitle,
    heroHighlight,
    heroSubtitle,
    heroImage,
    heroButtonLabel,
    heroExploreButtonLabel,
    navLabelShop,
    navLabelCategories,
    navLabelCollections,
    navLabelTrackOrder,
    navLabelAbout,
    navLabelLogin,
    promoText,
    searchPlaceholder,
    sectionShopByCategoryLabel,
    sectionShopByCategoryTitle,
    sectionProductsEnabled,
    sectionProductsLabel,
    sectionProductsTitle,
    sectionOrder,
    sectionNewArrivalsEnabled,
    sectionNewArrivalsLabel,
    sectionNewArrivalsTitle,
    sectionBestSellersEnabled,
    sectionBestSellersLabel,
    sectionBestSellersTitle,
    sectionTrendingEnabled,
    sectionTrendingLabel,
    sectionTrendingTitle,
    sectionFeaturedEnabled,
    sectionFeaturedLabel,
    sectionFeaturedTitle,
    sectionSaleEnabled,
    sectionSaleLabel,
    sectionSaleTitle,
    sectionSpecialOfferEnabled,
    sectionSpecialOfferLabel,
    sectionSpecialOfferTitle,
    sectionSpecialOfferButtonLabel,
    adminUsername,
    adminPassword,
    footerContactEmail,
    footerContactPhone,
    footerContactLocation,
    footerDeveloperText,
    footerDeveloperLink,
    footerDeveloperLinkLabel,
    footerMiddleText,
    footerWhatsAppButtonLabel,
    footerUpdatedDate,
    esewaEnabled,
    esewaLabel,
    esewaTitle,
    esewaDescription,
    esewaButtonLabel,
    esewaQrImage,
    whatsappNumber,
    whatsappMessage,
    notificationEmail,
    emailSubject,
    emailBody,
    designImages,
  ]);

  const sectionDefinitions = [
    { key: "shopByCategory", label: "Shop by category" },
    { key: "products", label: "Products" },
    { key: "newArrivals", label: "New arrivals" },
    { key: "bestSellers", label: "Best sellers" },
    { key: "trending", label: "Trending" },
    { key: "featured", label: "Featured" },
    { key: "sale", label: "Sale" },
    { key: "specialOffer", label: "Special offer" },
  ];

  const addSectionToOrder = (key: string) => {
    if (!key || sectionOrder.includes(key)) return;
    setSectionOrder(prev => [...prev, key]);
  };

  const removeSectionFromOrder = (key: string) => {
    setSectionOrder(prev => prev.filter(item => item !== key));
  };

  function handleSave() {
    saveSiteSettings(buildSettingsPayload());
    setSaved(true);
    setResetMessage("");
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset(action: "products" | "settings" | "orders" | "categories" | "all") {
    if (action === "products") resetProducts();
    if (action === "settings") resetSiteSettings();
    if (action === "orders") resetOrders();
    if (action === "categories") resetCategories();
    if (action === "all") resetAllData();
    setResetMessage(action === "all" ? "All data cleared, reload the page to refresh." : `${action.charAt(0).toUpperCase() + action.slice(1)} reset completed.`);
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Settings</p>
            <h1 className="text-3xl font-black mt-3">Website Editor</h1>
            <p className="text-sm text-white/70 mt-2">Edit the homepage hero, WhatsApp order template, and store branding.</p>
          </div>
          <button onClick={async () => { handleSave(); }} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>

        <div className="grid gap-5 mt-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <Image className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Hero section</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Site Name", value: siteName, setter: setSiteName },
                { label: "Tagline", value: tagline, setter: setTagline },
                { label: "Hero Top Label", value: heroTopLabel, setter: setHeroTopLabel },
                { label: "Hero Title", value: heroTitle, setter: setHeroTitle },
                { label: "Hero Highlight", value: heroHighlight, setter: setHeroHighlight },
                { label: "Hero Subtitle", value: heroSubtitle, setter: setHeroSubtitle },
                { label: "Hero Button Label", value: heroButtonLabel, setter: setHeroButtonLabel },
                { label: "Hero Explore Button Label", value: heroExploreButtonLabel, setter: setHeroExploreButtonLabel },
                { label: "Hero Image URL", value: heroImage, setter: setHeroImage },
              ].map(field => (
                <label key={field.label} className="block text-sm text-white/70">
                  <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">{field.label}</span>
                  <div className="flex gap-2">
                    <input value={field.value} onChange={e => field.setter(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                    <button type="button" onClick={() => heroImageInputRef.current?.click()}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white text-sm hover:bg-white/15 transition">Upload</button>
                  </div>
                </label>
              ))}
              <input ref={heroImageInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleHeroImageUpload(e.target.files)} />
              {heroImage && (
                <div className="rounded-3xl overflow-hidden border border-white/10 mt-3">
                  <img src={heroImage} alt="Hero preview" className="object-cover w-full h-48" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Navigation & Search</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Promo Text", value: promoText, setter: setPromoText },
                { label: "Search Placeholder", value: searchPlaceholder, setter: setSearchPlaceholder },
                { label: "Nav Label: Shop", value: navLabelShop, setter: setNavLabelShop },
                { label: "Nav Label: Categories", value: navLabelCategories, setter: setNavLabelCategories },
                { label: "Nav Label: Collections", value: navLabelCollections, setter: setNavLabelCollections },
                { label: "Nav Label: Track Order", value: navLabelTrackOrder, setter: setNavLabelTrackOrder },
                { label: "Nav Label: About", value: navLabelAbout, setter: setNavLabelAbout },
                { label: "Nav Label: Login", value: navLabelLogin, setter: setNavLabelLogin },
              ].map(field => (
                <label key={field.label} className="block text-sm text-white/70">
                  <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">{field.label}</span>
                  <input value={field.value} onChange={e => field.setter(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Admin Access</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Admin Username", value: adminUsername, setter: setAdminUsername },
                { label: "Admin Password", value: adminPassword, setter: setAdminPassword, type: "password" },
              ].map(field => (
                <label key={field.label} className="block text-sm text-white/70">
                  <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">{field.label}</span>
                  <input type={field.type || "text"} value={field.value} onChange={e => field.setter(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Footer Editor</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Footer Contact Email", value: footerContactEmail, setter: setFooterContactEmail },
                { label: "Footer Contact Phone", value: footerContactPhone, setter: setFooterContactPhone },
                { label: "Footer Location", value: footerContactLocation, setter: setFooterContactLocation },
                { label: "Footer Middle Text", value: footerMiddleText, setter: setFooterMiddleText },
                { label: "WhatsApp Button Label", value: footerWhatsAppButtonLabel, setter: setFooterWhatsAppButtonLabel },
                { label: "Developer Text", value: footerDeveloperText, setter: setFooterDeveloperText },
                { label: "Developer Link", value: footerDeveloperLink, setter: setFooterDeveloperLink },
                { label: "Developer Link Label", value: footerDeveloperLinkLabel, setter: setFooterDeveloperLinkLabel },
                { label: "Footer Updated Date", value: footerUpdatedDate, setter: setFooterUpdatedDate },
              ].map(field => (
                <label key={field.label} className="block text-sm text-white/70">
                  <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">{field.label}</span>
                  <input value={field.value} onChange={e => field.setter(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Homepage Sections</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Shop By Category Label", value: sectionShopByCategoryLabel, setter: setSectionShopByCategoryLabel },
                { label: "Shop By Category Title", value: sectionShopByCategoryTitle, setter: setSectionShopByCategoryTitle },
                { label: "Product Section Label", value: sectionProductsLabel, setter: setSectionProductsLabel },
                { label: "Product Section Title", value: sectionProductsTitle, setter: setSectionProductsTitle },
                { label: "Best Sellers Label", value: sectionBestSellersLabel, setter: setSectionBestSellersLabel },
                { label: "Best Sellers Title", value: sectionBestSellersTitle, setter: setSectionBestSellersTitle },
                { label: "Trending Label", value: sectionTrendingLabel, setter: setSectionTrendingLabel },
                { label: "Trending Title", value: sectionTrendingTitle, setter: setSectionTrendingTitle },
                { label: "Featured Label", value: sectionFeaturedLabel, setter: setSectionFeaturedLabel },
                { label: "Featured Title", value: sectionFeaturedTitle, setter: setSectionFeaturedTitle },
                { label: "Sale Label", value: sectionSaleLabel, setter: setSectionSaleLabel },
                { label: "Sale Title", value: sectionSaleTitle, setter: setSectionSaleTitle },
                { label: "Special Offer Label", value: sectionSpecialOfferLabel, setter: setSectionSpecialOfferLabel },
                { label: "Special Offer Title", value: sectionSpecialOfferTitle, setter: setSectionSpecialOfferTitle },
                { label: "Special Offer Button Label", value: sectionSpecialOfferButtonLabel, setter: setSectionSpecialOfferButtonLabel },
              ].map(field => (
                <label key={field.label} className="block text-sm text-white/70">
                  <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">{field.label}</span>
                  <input value={field.value} onChange={e => field.setter(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              ))}
              <div className="grid gap-3 mt-4">
                {[
                  { label: "Enable Products", checked: sectionProductsEnabled, setter: setSectionProductsEnabled },
                  { label: "Enable New Arrivals", checked: sectionNewArrivalsEnabled, setter: setSectionNewArrivalsEnabled },
                  { label: "Enable Best Sellers", checked: sectionBestSellersEnabled, setter: setSectionBestSellersEnabled },
                  { label: "Enable Trending", checked: sectionTrendingEnabled, setter: setSectionTrendingEnabled },
                  { label: "Enable Featured", checked: sectionFeaturedEnabled, setter: setSectionFeaturedEnabled },
                  { label: "Enable Sale", checked: sectionSaleEnabled, setter: setSectionSaleEnabled },
                  { label: "Enable Special Offer", checked: sectionSpecialOfferEnabled, setter: setSectionSpecialOfferEnabled },
                ].map(item => (
                  <label key={item.label} className="flex items-center gap-3 text-sm text-white/70">
                    <input type="checkbox" checked={item.checked} onChange={() => item.setter(!item.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-[#050505] text-red-500 focus:ring-red-400" />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">Homepage Section Order</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={sectionToAdd}
                      onChange={e => setSectionToAdd(e.target.value)}
                      className="rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <option value="">Add section...</option>
                      {sectionDefinitions.filter(def => !sectionOrder.includes(def.key)).map(def => (
                        <option key={def.key} value={def.key}>{def.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sectionToAdd) return;
                        addSectionToOrder(sectionToAdd);
                        setSectionToAdd("");
                      }}
                      className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {sectionOrder.map((sectionKey, index) => {
                  const labelMap = Object.fromEntries(sectionDefinitions.map(def => [def.key, def.label]));
                  return (
                    <div key={sectionKey} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#050505]/30 px-3 py-3">
                      <span className="text-sm text-white">{labelMap[sectionKey] ?? sectionKey}</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => {
                          if (index === 0) return;
                          const next = [...sectionOrder];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          setSectionOrder(next);
                        }} className="rounded-full bg-white/10 px-2 py-1 text-white hover:bg-white/20">↑</button>
                        <button type="button" onClick={() => {
                          if (index === sectionOrder.length - 1) return;
                          const next = [...sectionOrder];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          setSectionOrder(next);
                        }} className="rounded-full bg-white/10 px-2 py-1 text-white hover:bg-white/20">↓</button>
                        <button type="button" onClick={() => removeSectionFromOrder(sectionKey)} className="rounded-full bg-white/10 px-2 py-1 text-white hover:bg-white/20">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">eSewa Payment Settings</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input type="checkbox" checked={esewaEnabled} onChange={() => setEsewaEnabled(!esewaEnabled)} className="h-4 w-4 rounded border-white/20 bg-[#050505] text-red-500 focus:ring-red-400" />
                <span>Enable eSewa payment</span>
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">eSewa Label</span>
                <input value={esewaLabel} onChange={e => setEsewaLabel(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">eSewa Title</span>
                <input value={esewaTitle} onChange={e => setEsewaTitle(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">eSewa Description</span>
                <textarea value={esewaDescription} onChange={e => setEsewaDescription(e.target.value)} rows={3} className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">eSewa Button Label</span>
                <input value={esewaButtonLabel} onChange={e => setEsewaButtonLabel(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">eSewa QR Image URL</span>
                <div className="flex gap-2">
                  <input value={esewaQrImage} onChange={e => setEsewaQrImage(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <button type="button" onClick={() => qrInputRef.current?.click()}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white text-sm hover:bg-white/15 transition">Upload</button>
                </div>
              </label>
              <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleQrUpload(e.target.files)} />
              {esewaQrImage && (
                <div className="rounded-3xl overflow-hidden border border-white/10 mt-3 bg-black/10 p-4">
                  <img src={esewaQrImage} alt="eSewa QR code" className="mx-auto h-48 object-contain" />
                </div>
              )}
              <p className="text-xs text-white/50">Upload a QR image for eSewa payments or paste a hosted image URL.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">WhatsApp Number</span>
                <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">WhatsApp Message Template</span>
                <textarea value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">Notification Email</span>
                <input value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">Email Subject</span>
                <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="block text-sm text-white/70">
                <span className="block mb-2 text-xs uppercase tracking-[0.25em] text-white/50">Email Body Template</span>
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <p className="text-xs text-white/50">Use placeholders: <span className="text-white/80">{`{orderId}, {total}, {siteName}, {name}, {address}, {city}, {paymentMethod}, {status}`}</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mt-6">
          <div className="flex items-center gap-3 mb-5">
            <UploadCloud className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold">Website Design Images</h2>
          </div>
          <div
            className="border-dashed border-2 border-white/20 rounded-3xl p-6 text-center cursor-pointer bg-white/5 hover:border-white/40"
            onDrop={handleDrop}
            onDragOver={event => event.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm text-white/70">Drag & drop images here or click to upload</p>
            <p className="text-xs text-white/50 mt-2">These images can be used throughout the website design gallery.</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleDesignImages(e.target.files)} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designImages.map((image, index) => (
              <div key={image + index} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                <img src={image} alt={`Design ${index + 1}`} className="h-40 w-full object-cover" />
                <button type="button" onClick={() => setDesignImages(designImages.filter((_, idx) => idx !== index))}
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white opacity-80 hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mt-6">
          <div className="flex items-center gap-3 mb-5">
            <RefreshCcw className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold">Reset Data</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => handleReset("products")}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition">
              <p className="font-semibold">Reset Products</p>
              <p className="text-xs text-white/50 mt-1">Clear all products from local storage, keeping defaults on refresh.</p>
            </button>
            <button type="button" onClick={() => handleReset("settings")}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition">
              <p className="font-semibold">Reset Site Settings</p>
              <p className="text-xs text-white/50 mt-1">Restore homepage and notification settings to defaults.</p>
            </button>
            <button type="button" onClick={() => handleReset("orders")}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition">
              <p className="font-semibold">Reset Orders</p>
              <p className="text-xs text-white/50 mt-1">Remove all saved orders and last order history.</p>
            </button>
            <button type="button" onClick={() => handleReset("categories")}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition">
              <p className="font-semibold">Reset Categories</p>
              <p className="text-xs text-white/50 mt-1">Restore default category availability and collection settings.</p>
            </button>
            <button type="button" onClick={() => handleReset("all")}
              className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-100 hover:bg-red-500/20 transition">
              <p className="font-semibold">Reset All Data</p>
              <p className="text-xs text-red-100/80 mt-1">Clear products, settings, orders, coupons, reviews, and the cart.</p>
            </button>
          </div>
          {resetMessage && <p className="mt-4 text-sm text-white/70">{resetMessage}</p>}
        </div>

        {saved && <p className="mt-4 rounded-3xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-200">Settings saved locally.</p>}
      </div>
    </div>
  );
}
