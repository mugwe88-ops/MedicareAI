'use client';

import { useState, useEffect } from "react";
import { Pill, Search, ShoppingCart, Truck, CheckCircle2, ShieldCheck, Plus, Minus, X } from "lucide-react";

interface PharmacyItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  requires_prescription: boolean;
  stock: number;
}

interface CartItem extends PharmacyItem {
  quantity: number;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: string;
  address: string;
  created_at: string;
}

const MOCK_CATALOG: PharmacyItem[] = [
  { id: 1, name: "Amoxicillin 500mg", category: "Prescriptions", price: 15.00, description: "Broad-spectrum antibiotic for bacterial infections.", requires_prescription: true, stock: 45 },
  { id: 2, name: "Paracetamol 500mg", category: "OTC", price: 5.50, description: "Effective pain reliever and fever reducer.", requires_prescription: false, stock: 120 },
  { id: 3, name: "Ibuprofen 400mg", category: "OTC", price: 7.25, description: "Anti-inflammatory pain relief tablets.", requires_prescription: false, stock: 85 },
  { id: 4, name: "Daily Multivitamins", category: "Vitamins", price: 22.00, description: "Complete daily nutritional support capsules (90 count).", requires_prescription: false, stock: 60 },
  { id: 5, name: "Vitamin C 1000mg + Zinc", category: "Vitamins", price: 14.50, description: "Immune system support effervescent tablets.", requires_prescription: false, stock: 95 },
  { id: 6, name: "First Aid Trauma Kit", category: "First Aid", price: 35.00, description: "Compact emergency medical supplies and bandages.", requires_prescription: false, stock: 30 },
];

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "prescriptions" | "orders">("catalog");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Filter Catalog
  const filteredCatalog = MOCK_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: PharmacyItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean) as CartItem[]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cartTotal + 5.00, // adding $5 delivery fee
      status: "Processing",
      address,
      created_at: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCheckoutOpen(false);
    setAddress("");
    setActiveTab("orders");
    setSuccessMsg("Order placed successfully! Pharmacy is preparing your items.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100 space-y-8">
      {/* HEADER & CART TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Pharmacy Store</h1>
          <p className="text-slate-400 text-sm mt-1">Order your prescription medicines and health essentials directly to your home.</p>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-extrabold border-2 border-slate-950">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "catalog", label: "Medicine Catalog & Essentials" },
          { id: "prescriptions", label: "My Digital Prescriptions" },
          { id: "orders", label: "Track Orders" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id 
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* SEARCH & CATEGORY FILTER */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex gap-2 p-3 border border-slate-800 rounded-xl items-center bg-slate-950 w-full md:w-96">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prescriptions, tablets, vitamins..." 
                className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {["All", "Prescriptions", "OTC", "Vitamins", "First Aid"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-750"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map(product => (
              <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-blue-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-lg font-black text-white">${product.price.toFixed(2)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{product.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {product.requires_prescription ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Rx Required
                      </span>
                    ) : (
                      <span className="text-emerald-400">Over-The-Counter</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS */}
      {activeTab === "prescriptions" && (
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
          <Pill className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-lg">Verified Digital Prescriptions</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your active digital prescriptions issued by clinicians will appear here automatically for one-click pharmacy ordering.
          </p>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white">Order History</h2>
          {orders.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
              No active pharmacy orders found.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-mono text-slate-400">Order #{order.id}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total (incl. delivery)</span>
                  <span className="text-blue-400">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CHECKOUT MODAL DRAWER */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" /> Your Shopping Cart
                </h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-bold text-sm text-blue-400">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <span className="text-xs text-slate-400">Quantity</span>
                        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-white">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white font-mono">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-white">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Delivery Address</label>
                      <input 
                        type="text" 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full street address for delivery..."
                        className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 pt-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono text-white">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Express Delivery Fee</span>
                        <span className="font-mono text-white">$5.00</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                        <span>Total</span>
                        <span className="text-blue-400 font-mono">${(cartTotal + 5.00).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/30"
                    >
                      Place Secure Order
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}