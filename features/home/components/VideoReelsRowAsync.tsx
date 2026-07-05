import { getLatest } from '@/lib/content';
import VideoReelsRowClient from './VideoReelsRowClient';

export default async function VideoReelsRowAsync() {
  const videos = await getLatest('media', 5);
  return <VideoReelsRowClient videos={videos} />;
}