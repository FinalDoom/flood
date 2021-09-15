import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface StatusFilter {
  type: 'status';
  filter: TorrentStatus[];
}

interface TrackerFilter {
  type: 'tracker';
  filter: string[];
}

interface TagFilter {
  type: 'tag';
  filter: string[];
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  const {type, filter} = opts;

  if (filter.length > 0) {
    if (type === 'status') {
      return torrentList.filter((torrent) => torrent.status.some(status => filter.includes(status)));
    }
    if (type === 'tracker') {
      return torrentList.filter((torrent) => torrent.trackerURIs.some(uri => (filter as string[]).includes(uri)));
    }
    if (type === 'tag') {
      const includeUntagged = (filter as string[]).includes('untagged');
      return torrentList.filter((torrent) => 
        includeUntagged && torrent.tags.length === 0  || torrent.tags.some(tag => (filter as string[]).includes(tag))
      );
    }
  }

  return torrentList;
}

export default filterTorrents;
