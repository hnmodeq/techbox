import { getLatest } from '@/lib/content';
import MagazineRowClient from './MagazineRowClient';

export default async function MagazineRowAsync() {
  const articles = await getLatest('blog', 5);
  return <MagazineRowClient articles={articles} />;
}