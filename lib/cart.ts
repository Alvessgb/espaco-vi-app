export interface CartItem {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  durationMinutes: number;
  imageUrl?: string;
}

const CART_KEY = "vi_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const exists = cart.find((i) => i.id === item.id);
  if (!exists) {
    cart.push(item);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function removeFromCart(id: string): void {
  const cart = getCart().filter((i) => i.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.priceInCents, 0);
}

export function getCartDuration(): number {
  return getCart().reduce((sum, i) => sum + i.durationMinutes, 0);
}
