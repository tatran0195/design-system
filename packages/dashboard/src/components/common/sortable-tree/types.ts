import type { DraggableAttributes, DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import type { MutableRefObject } from 'react';

export interface TreeItem extends Record<string, unknown> {
  id: UniqueIdentifier;
}

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;

export type HandleProps = {
  attributes?: DraggableAttributes | undefined;
  listeners?: DraggableSyntheticListeners;
};
