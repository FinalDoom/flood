import {computed, makeAutoObservable} from 'mobx';
import jsonpatch, {Operation} from 'fast-json-patch';
import { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import type {Taxonomy} from '@shared/types/Taxonomy';
import torrentStatusMap, {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface Filter<T extends TorrentStatus | string> {
  include: Array<T>;
  exclude: Array<T>;
}

interface StatusFilter extends Filter<TorrentStatus> {}
interface TagFilter extends Filter<string> {}
interface TrackerFilter extends Filter<string> {}

class TorrentFilterStore {
  private lastStatus?: TorrentStatus;
  private lastTag?: string;
  private lastTracker?: string;

  filters: {
    searchFilter: string;
    statusFilter: StatusFilter;
    tagFilter: TagFilter;
    trackerFilter: TrackerFilter;
  } = {
    searchFilter: '',
    statusFilter: {
      include: [],
      exclude: [],
    },
    tagFilter: {
      include: [],
      exclude: [],
    },
    trackerFilter: {
      include: [],
      exclude: [],
    },
  };

  taxonomy: Taxonomy = {
    statusCounts: {},
    tagCounts: {},
    tagSizes: {},
    trackerCounts: {},
    trackerSizes: {},
  };

  @computed get isFilterActive() {
    return (
      this.filters.searchFilter !== '' ||
      this.filters.statusFilter.include.length ||
      this.filters.statusFilter.exclude.length ||
      this.filters.tagFilter.include.length ||
      this.filters.tagFilter.exclude.length ||
      this.filters.trackerFilter.include.length ||
      this.filters.trackerFilter.exclude.length
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAllFilters() {
    this.filters = {
      searchFilter: '',
      statusFilter: {
        include: [],
        exclude: [],
      },
      tagFilter: {
        include: [],
        exclude: [],
      },
      trackerFilter: {
        include: [],
        exclude: [],
      },
    };
  }

  handleTorrentTaxonomyDiffChange(diff: Operation[]) {
    jsonpatch.applyPatch(this.taxonomy, diff);
  }

  handleTorrentTaxonomyFullUpdate(taxonomy: Taxonomy) {
    this.taxonomy = taxonomy;
  }

  setSearchFilter(filter: string) {
    this.filters = {
      ...this.filters,
      searchFilter: filter,
    };
  }

  setStatusFilters(filter: TorrentStatus | '', event: KeyboardEvent | MouseEvent | TouchEvent) {
    this.computeFilters(torrentStatusMap, this.filters.statusFilter, filter, event);
  }

  setTagFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const tags = Object.keys(this.taxonomy.tagCounts).sort((a,b) => {if (a === 'Untagged') return -1; else if (b === 'Untagged') return 1; else return a.localeCompare(b);});
    // Put 'untagged' in the correct second position for shift click ordering
    tags.splice(tags.indexOf('untagged'),1);
    tags.splice(1,0,'untagged');

    this.computeFilters(tags, this.filters.tagFilter, filter, event);
  }

  setTrackerFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const trackers = Object.keys(this.taxonomy.trackerCounts).sort((a,b) => a.localeCompare(b));

    this.computeFilters(trackers, this.filters.trackerFilter, filter, event);
  }

  private computeFilters<T extends TorrentStatus | string>(keys: readonly T[], currentFilters: Filter<T>, newFilter: T, event: KeyboardEvent | MouseEvent | TouchEvent) {
    if (newFilter === '' as T) {
      currentFilters.include.splice(0);
    } else if (event.shiftKey) {
      if (currentFilters.include.length) {
        const lastKey = currentFilters.include[currentFilters.include.length - 1];
        const lastKeyIndex = keys.indexOf(lastKey);
        let currentKeyIndex = keys.indexOf(newFilter);

        if (!~currentKeyIndex || !~lastKeyIndex) {
          return;
        }
  
        // from the previously selected index to the currently selected index,
        // add all filters to the selected array.
        // if the newly selcted index is larger than the previous, start from
        // the newly selected index and work backwards. otherwise go forwards.
        const increment = currentKeyIndex > lastKeyIndex ? -1 : 1;
  
        for (; currentKeyIndex !== lastKeyIndex; currentKeyIndex += increment) {
          const foundKey = keys[currentKeyIndex] as T;
          // if the filter isn't already selected, add the filter to the array.
          if (!currentFilters.include.includes(foundKey)) {
            currentFilters.include.push(foundKey);
          }
        }
      } else {
        currentFilters.include.splice(0, currentFilters.include.length, newFilter);
      }
    } else if (event.metaKey || event.ctrlKey) {
      if (currentFilters.include.includes(newFilter)) {
        currentFilters.include.splice(currentFilters.include.indexOf(newFilter), 1);
      } else {
        currentFilters.include.push(newFilter);
      }
    } else {
      currentFilters.include.splice(0, currentFilters.include.length, newFilter);
    }
  }
}

export default new TorrentFilterStore();
