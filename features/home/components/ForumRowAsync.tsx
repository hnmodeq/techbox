import { getLatest } from '@/lib/content';
import ForumRowClient from './ForumRowClient';

export default async function ForumRowAsync() {
  const topics = await getLatest('forum', 6);
  return <ForumRowClient topics={topics} />;
}