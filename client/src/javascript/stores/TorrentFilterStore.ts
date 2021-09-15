import {computed, makeAutoObservable} from 'mobx';
import jsonpatch, {Operation} from 'fast-json-patch';
import { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import type {Taxonomy} from '@shared/types/Taxonomy';
import torrentStatusMap, {TorrentStatus} from '@shared/constants/torrentStatusMap';

class TorrentFilterStore {
  filters: {
    searchFilter: string;
    statusFilter: Array<TorrentStatus>;
    tagFilter: Array<string>;
    trackerFilter: Array<string>;
  } = {
    searchFilter: '',
    statusFilter: [],
    tagFilter: [],
    trackerFilter: [],
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
      this.filters.statusFilter.length ||
      this.filters.tagFilter.length ||
      this.filters.trackerFilter.length
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAllFilters() {
    this.filters = {
      searchFilter: '',
      statusFilter: [],
      tagFilter: [],
      trackerFilter: [],
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
    if (filter === '') {
      this.filters.statusFilter.splice(0);
    } else if (event.shiftKey) {
      if (this.filters.statusFilter.length) {
        const lastStatus = this.filters.statusFilter[this.filters.statusFilter.length - 1];
        const lastStatusIndex = torrentStatusMap.indexOf(lastStatus);
        let currentStatusIndex = torrentStatusMap.indexOf(filter);

        if (!~currentStatusIndex || !~lastStatusIndex) {
          return;
        }
  
        // from the previously selected index to the currently selected index,
        // add all statuses to the selected array.
        // if the newly selcted index is larger than the previous, start from
        // the newly selected index and work backwards. otherwise go forwards.
        const increment = currentStatusIndex > lastStatusIndex ? -1 : 1;
  
        for (; currentStatusIndex !== lastStatusIndex; currentStatusIndex += increment) {
          const foundStatus = torrentStatusMap[currentStatusIndex];
          // if the status isn't already selected, add the status to the array.
          if (!this.filters.statusFilter.includes(foundStatus)) {
            this.filters.statusFilter.push(foundStatus);
          }
        }
      } else {
        this.filters.statusFilter.splice(0, this.filters.statusFilter.length, filter);
      }
    } else if (event.metaKey || event.ctrlKey) {
      if (this.filters.statusFilter.includes(filter)) {
        this.filters.statusFilter.splice(this.filters.statusFilter.indexOf(filter), 1);
      } else {
        this.filters.statusFilter.push(filter);
      }
    } else {
      this.filters.statusFilter.splice(0, this.filters.statusFilter.length, filter);
    }
  }

  setTagFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    if (filter === '') {
      this.filters.tagFilter.splice(0);
    } else if (event.shiftKey) {
      if (this.filters.tagFilter.length) {
        const tags = Object.keys(this.taxonomy.tagCounts).sort((a,b) => {if (a === 'Untagged') return -1; else if (b === 'Untagged') return 1; else return a.localeCompare(b);});
        // Put 'untagged' in the correct second position
        tags.splice(tags.indexOf('untagged'),1);
        tags.splice(1,0,'untagged');
        const lastTag = this.filters.tagFilter[this.filters.tagFilter.length - 1];
        const lastTagIndex = tags.indexOf(lastTag);
        let currentTagIndex = tags.indexOf(filter);

        if (!~currentTagIndex || !~lastTagIndex) {
          return;
        }
  
        // from the previously selected index to the currently selected index,
        // add all tags to the selected array.
        // if the newly selcted index is larger than the previous, start from
        // the newly selected index and work backwards. otherwise go forwards.
        const increment = currentTagIndex > lastTagIndex ? -1 : 1;
  
        for (; currentTagIndex !== lastTagIndex; currentTagIndex += increment) {
          const foundTag = tags[currentTagIndex];
          // if the tag isn't already selected, add the tag to the array.
          if (!this.filters.tagFilter.includes(foundTag)) {
            this.filters.tagFilter.push(foundTag);
          }
        }
      } else {
        this.filters.tagFilter.splice(0, this.filters.tagFilter.length, filter);
      }
    } else if (event.metaKey || event.ctrlKey) {
      if (this.filters.tagFilter.includes(filter)) {
        this.filters.tagFilter.splice(this.filters.tagFilter.indexOf(filter), 1);
      } else {
        this.filters.tagFilter.push(filter);
      }
    } else {
      this.filters.tagFilter.splice(0, this.filters.tagFilter.length, filter);
    }
  }

  setTrackerFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    if (filter === '') {
      this.filters.trackerFilter.splice(0);
    } else if (event.shiftKey) {
      if (this.filters.trackerFilter.length) {
        const trackers = Object.keys(this.taxonomy.trackerCounts).sort((a,b) => a.localeCompare(b));
        const lastTracker = this.filters.trackerFilter[this.filters.trackerFilter.length - 1];
        const lastTrackerIndex = trackers.indexOf(lastTracker);
        let currentTrackerIndex = trackers.indexOf(filter);

        if (!~currentTrackerIndex || !~lastTrackerIndex) {
          return;
        }
  
        // from the previously selected index to the currently selected index,
        // add all trackers to the selected array.
        // if the newly selcted index is larger than the previous, start from
        // the newly selected index and work backwards. otherwise go forwards.
        const increment = currentTrackerIndex > lastTrackerIndex ? -1 : 1;
  
        for (; currentTrackerIndex !== lastTrackerIndex; currentTrackerIndex += increment) {
          const foundTracker = trackers[currentTrackerIndex];
          // if the tracker isn't already selected, add the tracker to the array.
          if (!this.filters.trackerFilter.includes(foundTracker)) {
            this.filters.trackerFilter.push(foundTracker);
          }
        }
      } else {
        this.filters.trackerFilter.splice(0, this.filters.trackerFilter.length, filter);
      }
    } else if (event.metaKey || event.ctrlKey) {
      if (this.filters.trackerFilter.includes(filter)) {
        this.filters.trackerFilter.splice(this.filters.trackerFilter.indexOf(filter), 1);
      } else {
        this.filters.trackerFilter.push(filter);
      }
    } else {
      this.filters.trackerFilter.splice(0, this.filters.trackerFilter.length, filter);
    }
  }
}

export default new TorrentFilterStore();
