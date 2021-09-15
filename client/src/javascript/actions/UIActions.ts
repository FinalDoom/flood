import {KeyboardEvent, MouseEvent, TouchEvent} from 'react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import TorrentFilterStore from '../stores/TorrentFilterStore';
import TorrentStore from '../stores/TorrentStore';
import UIStore from '../stores/UIStore';

import type {ActiveContextMenu, Modal} from '../stores/UIStore';

const UIActions = {
  displayContextMenu: (contextMenu: ActiveContextMenu) => {
    UIStore.setActiveContextMenu(contextMenu);
  },

  displayDropdownMenu: (id: string | null) => {
    UIStore.setActiveDropdownMenu(id);
  },

  displayModal: (modal: Modal) => {
    UIStore.setActiveModal(modal);
  },

  dismissContextMenu: (id: string) => {
    UIStore.dismissContextMenu(id);
  },

  dismissModal: () => {
    UIStore.dismissModal();
  },

  handleTorrentClick: (data: {event: KeyboardEvent | MouseEvent | TouchEvent; hash: string}) => {
    TorrentStore.setSelectedTorrents(data);
  },

  selectAllTorrents: () => {
    TorrentStore.selectAllTorrents();
  },

  setTorrentStatusFilter: (status: TorrentStatus, event: KeyboardEvent | MouseEvent | TouchEvent) => {
    TorrentFilterStore.setStatusFilters(status, event);
  },

  setTorrentTagFilter: (tag: string, event: KeyboardEvent | MouseEvent | TouchEvent) => {
    TorrentFilterStore.setTagFilters(tag, event);
  },

  setTorrentTrackerFilter: (tracker: string, event: KeyboardEvent | MouseEvent | TouchEvent) => {
    TorrentFilterStore.setTrackerFilters(tracker, event);
  },

  setTorrentsSearchFilter: (search: string) => {
    TorrentFilterStore.setSearchFilter(search);
  },
} as const;

export default UIActions;
