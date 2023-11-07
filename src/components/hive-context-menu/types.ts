export interface ContextMenuSeparator {
  separator: true;
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  items?: ContextMenuItems;
}

export type ContextMenuItems = (ContextMenuItem | ContextMenuSeparator)[];
