import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface StatusFilter {
  type: 'status';
  filter: Map<TorrentStatus, boolean>;
}

interface TrackerFilter {
  type: 'tracker';
  filter: Map<string, boolean>;
}

interface TagFilter {
  type: 'tag';
  filter: Map<string, boolean>;
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  const {type, filter} = opts;

  if (filter.size) {
    if (type === 'status') {
      return torrentList.filter((torrent) => {
        let include = false;
        torrent.status.forEach((status) => {
          if (filter.has(status)) {
            if (filter.get(status)) {
              include = true;
            } else {
              return false;
            }
          }
        });
        return include;
      });
    } else if (type === 'tracker') {
      return torrentList.filter((torrent) => {
        let include = false;
        torrent.trackerURIs.forEach((uri) => {
          if ((filter as Map<string, boolean>).has(uri)) {
            if ((filter as Map<string, boolean>).get(uri)) {
              include = true;
            } else {
              return false;
            }
          }
        });
        return include;
      });
    } else if (type === 'tag') {
      return torrentList.filter((torrent) => {
        let include = false;
        torrent.tags.forEach((tag) => {
          if ((filter as Map<string, boolean>).has(tag)) {
            if ((filter as Map<string, boolean>).get(tag)) {
              include = true;
            } else {
              return false;
            }
          }
        });
        return include;
      });
    }
  }

  return torrentList;
}

export default filterTorrents;
