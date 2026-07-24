"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { CartItem } from "@/lib/types";

type State = { items: CartItem[] };
type Action =
	| { type: "ADD"; item: CartItem }
	| { type: "REMOVE"; id: string; size: string; variantSelections?: Record<string, string> }
	| { type: "UPDATE_QTY"; id: string; size: string; qty: number; variantSelections?: Record<string, string> }
	| { type: "CLEAR" }
	| { type: "INIT"; items: CartItem[] };

const CART_STORAGE_KEY = "9teen_cart";
const LEGACY_CART_STORAGE_KEY = "19teen_cart";
const initialState: State = { items: [] };

function sameVariantSelections(a?: Record<string, string>, b?: Record<string, string>) {
	const aKeys = a ? Object.keys(a).sort() : [];
	const bKeys = b ? Object.keys(b).sort() : [];
	if (aKeys.length !== bKeys.length) return false;
	return aKeys.every(key => b?.[key] === a![key]);
}

function matchesItem(item: CartItem, other: { id: string; size: string; variantSelections?: Record<string, string> }) {
	return item.id === other.id && item.size === other.size && sameVariantSelections(item.variantSelections, other.variantSelections);
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "ADD": {
			const existing = state.items.find(i => matchesItem(i, action.item));
			if (existing) {
				return { items: state.items.map(i => matchesItem(i, action.item) ? { ...i, quantity: i.quantity + action.item.quantity } : i) };
			}
			return { items: [...state.items, action.item] };
		}
		case "REMOVE":
			return { items: state.items.filter(i => !matchesItem(i, action)) };
		case "UPDATE_QTY":
			return { items: state.items.map(i => matchesItem(i, action) ? { ...i, quantity: action.qty } : i) };
		case "CLEAR":
			return { items: [] };
		case "INIT":
			return { items: action.items };
		default:
			return state;
	}
}

const CartContext = createContext<{
	items: CartItem[];
	total: number;
	count: number;
	dispatch: React.Dispatch<Action>;
}>({ items: [], total: 0, count: 0, dispatch: () => undefined });

function calcTotals(items: CartItem[]) {
	const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
	const count = items.reduce((s, i) => s + i.quantity, 0);
	return { total, count };
}

function readStoredCartItems(): CartItem[] {
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		if (raw) {
			return JSON.parse(raw) as CartItem[];
		}

		const legacyRaw = localStorage.getItem(LEGACY_CART_STORAGE_KEY);
		if (legacyRaw) {
			const items = JSON.parse(legacyRaw) as CartItem[];
			localStorage.setItem(CART_STORAGE_KEY, legacyRaw);
			localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
			return items;
		}
	} catch {
		// ignore invalid storage data
	}

	return [];
}

async function persistCartToSharedStorage(items: CartItem[]) {
	if (typeof window === "undefined") return;
	try {
		await fetch("/api/storage", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: CART_STORAGE_KEY, value: items }),
		});
	} catch {
		// ignore sync failures
	}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		const items = readStoredCartItems();
		if (items.length > 0 || localStorage.getItem(CART_STORAGE_KEY) !== null || localStorage.getItem(LEGACY_CART_STORAGE_KEY) !== null) {
			dispatch({ type: "INIT", items });
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
			localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
		} catch {}
		void persistCartToSharedStorage(state.items);
	}, [state.items]);

	const { total, count } = calcTotals(state.items);

	return (
		<CartContext.Provider value={{ items: state.items, total, count, dispatch }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	return useContext(CartContext);
}

export default CartContext;