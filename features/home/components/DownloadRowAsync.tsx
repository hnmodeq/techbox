import { getLatest } from '@/lib/content';
import DownloadRowClient from './DownloadRowClient';

export default async function DownloadRowAsync() {
  const files = await getLatest('download', 8);
  return <DownloadRowClient files={files} />;
}