import { switchCase } from '@earnkeeper/ekp-sdk';
import { commify } from '../../util/rpc/commify.rpc';
import {
  EDITION_IMAGE_MAP,
  FOIL_IMAGE_MAP,
  MANA_IMAGE,
  RARITY_IMAGE_MAP,
  ROLE_IMAGE_MAP,
  SPLINTER_IMAGE_MAP,
} from '../constants';
import { imageLabelCell } from './imageLabelCell';

export const RARITY_COLUMN = {
  id: 'rarity',
  sortable: true,
  minWidth: '140px',
  cell: imageLabelCell(switchCase('$.rarity', RARITY_IMAGE_MAP), '$.rarity'),
};

export const POWER_COLUMN = {
  id: 'power',
  sortable: true,
  format: commify('$.power'),
};

export const SPLINTER_COLUMN = {
  id: 'splinter',
  cell: imageLabelCell(
    switchCase('$.splinter', SPLINTER_IMAGE_MAP),
    '$.splinter',
  ),
};

export const EDITION_COLUMN = {
  id: 'edition',
  cell: imageLabelCell(switchCase('$.edition', EDITION_IMAGE_MAP), '$.edition'),
  minWidth: '120px',
};

export const ROLE_COLUMN = {
  id: 'role',
  cell: imageLabelCell(switchCase('$.role', ROLE_IMAGE_MAP), '$.role'),
  minWidth: '130px',
};

export const MANA_COLUMN = {
  id: 'mana',
  cell: imageLabelCell(MANA_IMAGE, '$.mana'),
  width: '80px',
  sortable: true,
};

export const LEVEL_COLUMN = {
  id: 'level',
  width: '70px',
  sortable: true,
};

export const FOIL_COLUMN = {
  id: 'foil',
  cell: imageLabelCell(switchCase('$.foil', FOIL_IMAGE_MAP), '$.foil'),
};
