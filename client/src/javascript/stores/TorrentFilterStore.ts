import {computed, makeAutoObservable} from 'mobx';
import jsonpatch, {Operation} from 'fast-json-patch';
import { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import type {Taxonomy} from '@shared/types/Taxonomy';
import torrentStatusMap, {TorrentStatus} from '@shared/constants/torrentStatusMap';

class TorrentFilterStore {
  private lastStatus: TorrentStatus | '' = '';
  private lastTag = '';
  private lastTracker = '';

  filters: {
    searchFilter: string;
    statusFilter: Map<TorrentStatus, boolean>;
    tagFilter: Map<string, boolean>;
    trackerFilter: Map<string, boolean>;
  } = {
    searchFilter: '',
    statusFilter: new Map(),
    tagFilter: new Map(),
    trackerFilter: new Map(),
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
      this.filters.statusFilter.size ||
      this.filters.tagFilter.size ||
      this.filters.trackerFilter.size
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAllFilters() {
    this.filters.searchFilter = '';
    this.filters.statusFilter.clear();
    this.filters.tagFilter.clear();
    this.filters.trackerFilter.clear();
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
    this.lastStatus = this.computeFilters(torrentStatusMap, this.filters.statusFilter, this.lastStatus, filter, event);
  }

  setTagFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const tags = Object.keys(this.taxonomy.tagCounts).sort((a,b) => {if (a === 'Untagged') return -1; else if (b === 'Untagged') return 1; else return a.localeCompare(b);});
    // Put 'untagged' in the correct second position for shift click ordering
    tags.splice(tags.indexOf('untagged'),1);
    tags.splice(1,0,'untagged');

    this.lastTag = this.computeFilters(tags, this.filters.tagFilter, this.lastTag, filter, event);
  }

  setTrackerFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const trackers = Object.keys(this.taxonomy.trackerCounts).sort((a,b) => a.localeCompare(b));

    this.lastTracker = this.computeFilters(trackers, this.filters.trackerFilter, this.lastTracker, filter, event);
  }

  private computeFilters<T extends TorrentStatus | string>(keys: readonly T[], currentFilters: Map<T, boolean>, previousFilter: T, newFilter: T, event: KeyboardEvent | MouseEvent | TouchEvent): T {
    // Behavior, matches file explorer selection logic + special use of ALT = exclude
    //
    // value=true
    // ALT -> value=false                   # true means include, false means exclude
    //
    // action=set,last=clicked              # Set present in map
    // CTRL -> action=toggle,last=clicked   # Toggle presence in map
    // SHIFT -> action=set,last=last
    //    if !+CTRL: clear() first          # Clear map first
    //    else: action=match                # Presence in map matches previousFilter presence
    //  do loop from last->clicked: action

    const value = !event.altKey;
    let last = newFilter;

    // Special "All" case
    if (newFilter === '' as T) {
      currentFilters.clear();
    } else if (event.shiftKey) {
      // Maintain previously selected filter as last
      last = previousFilter;
      // action=set is common except when action=match and previousFilter is not in map
      let action = (filter: T): Map<T, boolean> | boolean => currentFilters.set(filter, value);
      if (event.ctrlKey || event.metaKey) {
        if (!currentFilters.has(previousFilter)) {
          // action=match
          action = (filter: T) => currentFilters.delete(filter);
        }
      } else {
        currentFilters.clear();
      }
      // If previously selected was '' ("All"), instead begin selection from the next at index 1
      const previousKeyIndex = previousFilter === '' as T ? 1 : keys.indexOf(previousFilter);
      const newKeyIndex = keys.indexOf(newFilter);

      // If we couldn't find one or the other key, return
      if (!~newKeyIndex || !~previousKeyIndex) {
        return last;
      }

      // from the previously selected index to the currently selected index,
      // execute action on each filter.
      // if the newly selcted index is larger than the previous, start from
      // the newly selected index and work backwards. otherwise go forwards.
      const increment = previousKeyIndex < newKeyIndex ? 1 : -1;

      for (let i = previousKeyIndex; i !== newKeyIndex + increment; i += increment) {
        action(keys[i]);
      }
    } else if (event.ctrlKey) {
      // action=toggle
      if (currentFilters.has(newFilter)) {
        currentFilters.delete(newFilter);
      } else {
        currentFilters.set(newFilter, value);
      }
    } else { // just click with no modifiers
      // action=set
      currentFilters.clear();
      currentFilters.set(newFilter, value);
    }
    return last;
  }
}

export default new TorrentFilterStore();
