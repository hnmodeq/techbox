import { redirect } from "next/navigation";

// Legacy checkout URL retained only as a permanent in-app compatibility route.
// The shop has one active cart and payment flow at /shop/checkout.
export default function BuyingPage() {
  redirect("/shop/checkout");
}
