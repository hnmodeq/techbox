import { getLatest } from '@/lib/content';
import ReviewRowClient from './ReviewRowClient';

export default async function ReviewRowAsync() {
  const reviews = await getLatest('review', 5);
  return <ReviewRowClient reviews={reviews} />;
}