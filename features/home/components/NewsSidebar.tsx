import { getModuleItems } from '@/lib/content';
import NewsSidebarClient from './NewsSidebarClient';

export default async function NewsSidebar() {
  const newsItems = await getModuleItems('news');
  return <NewsSidebarClient newsItems={newsItems.slice(0, 15)} />;
}