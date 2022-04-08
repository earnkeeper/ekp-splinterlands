import { DefaultProps, Rpc, UiElement } from '@earnkeeper/ekp-sdk';

export function Datatable(props: DatatableProps): UiElement {
  return {
    _type: 'Datatable',
    props,
  };
}

export type DatatableProps = Readonly<{
  busyWhen?: boolean | string | Rpc;
  columns: DatatableColumn[];
  data: any[] | Rpc;
  defaultSortAsc?: boolean;
  defaultSortFieldId?: string;
  defaultView?:
    | DatatableView
    | Readonly<{
        xs?: DatatableView;
        sm?: DatatableView;
        md?: DatatableView;
        lg?: DatatableView;
        xl?: DatatableView;
        xxl?: DatatableView;
      }>;
  dense?: boolean;
  disabled?: boolean;
  filters?: FilterSchemaDto[];
  gridView?: { tileWidth?: number[]; tile: UiElement };
  highlightOnHover?: boolean;
  noTableHead?: boolean;
  onRowClicked?: Rpc;
  pagination?: boolean;
  paginationPerPage?: number;
  pointerOnHover?: boolean;
  showExport?: boolean;
  showLastUpdated?: boolean;
  stripe?: boolean;
}> &
  DefaultProps;

export type DatatableColumn = Readonly<{
  cell?: UiElement;
  center?: boolean;
  compact?: boolean;
  format?: string | Rpc;
  grow?: number;
  hide?: string | number;
  id: string;
  maxWidth?: string;
  minWidth?: string;
  omit?: boolean;
  reorder?: boolean;
  right?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  title?: string;
  value?: number | string | Rpc;
  width?: string;
  wrap?: boolean;
}>;

export type FilterSchemaDto = Readonly<{
  columnId: string;
  defaults?: boolean | boolean[] | Rpc;
  max?: number | Rpc;
  min?: number | Rpc;
  allowCustomOption?: boolean;
  options?: FilterOption[] | Rpc;
  type: string;
  imageMap?: Record<string, string>;
}>;

export type DatatableView = 'grid' | 'column';

export type FilterOption =
  | string
  | Readonly<{
      label: string;
      query?: string;
    }>;
