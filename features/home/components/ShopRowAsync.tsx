import { getLatest } from '@/lib/content';
import ShopRowClient from './ShopRowClient';

export default async function ShopRowAsync() {
  const products = await getLatest('shop', 5);
  return <ShopRowClient products={products} />;
}