'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill, Search, ShoppingCart, Truck, CheckCircle2, ShieldCheck, Plus, Minus, X, ArrowLeft } from "lucide-react";

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"catalog" | "prescriptions" | "orders">("catalog");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>("");

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
      total: cartTotal + 5.00,
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
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full text-slate-800">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/patient/dashboard")} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pharmacy Store</h1>
            <p className="text-xs text-slate-400 font-medium">Order your prescription medicines and health essentials directly to your home.</p>
          </div>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition shadow-sm cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "catalog", label: "Medicine Catalog & Essentials" },
          { id: "prescriptions", label: "My Digital Prescriptions" },
          { id: "orders", label: "Track Orders" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex gap-2 px-3 py-2 border border-slate-200 rounded-2xl items-center bg-slate-50 w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prescriptions, tablets, vitamins..." 
                className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {["All", "Prescriptions", "OTC", "Vitamins", "First Aid"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map(product => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{product.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold">
                    {product.requires_prescription ? (
                      <span className="text-amber-600 flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Rx Required
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Over-The-Counter</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto shadow-sm">
          <Pill className="w-10 h-10 mx-auto text-blue-600 mb-1" />
          <h3 className="font-black text-slate-900 text-base">Verified Digital Prescriptions</h3>
          <p className="text-xs text-slate-400 font-medium">
            Your active digital prescriptions issued by clinicians will appear here automatically for one-click pharmacy ordering.
          </p>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4 max-w-2xl mx-auto w-full">
          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold shadow-sm">
              No active pharmacy orders found.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Order #{order.id}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-black text-slate-900">
                  <span>Total (incl. delivery)</span>
                  <span className="text-blue-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" /> Your Shopping Cart
                </h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-xs text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-black text-xs text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-bold">Quantity</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"><Minus size={12} /></button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Delivery Address</label>
                      <input 
                        type="text" 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter street address, building, apartment..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 outline-none focus:border-blue-600 transition"
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-slate-900">
                      <span>Delivery Fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Amount</span>
                      <span className="text-blue-600">${(cartTotal + 5.00).toFixed(2)}</span>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition shadow-sm cursor-pointer mt-4"
                    >
                      Confirm Order & Checkout
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