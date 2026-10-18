'use client';

import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Fragment, type ReactNode, useMemo } from 'react';
import { CORE_LAYOUTS } from './core-layouts';
import { buildCoreEntries, buildDisplayEntries, extractSectionElements, getSectionIdFromTailId, isSectionTailId, type RawEntry } from './entries';
import { LayoutEntry } from './entry';
import { SectionDropzone } from './section-dropzone';
import { SortableEntry } from './sortable-entry';
import type { LayoutControlSize, LayoutDefinition, LayoutPreference, SectionWidgetMap } from './types';
export interface LayoutComposerProps {
  layout?: string | LayoutDefinition;
  layouts?: LayoutDefinition[];
  sections: Record<string, ReactNode>;
  widgets?: SectionWidgetMap;
  data?: unknown;
  preference?: LayoutPreference;
  onPreferenceChange?: (value: LayoutPreference) => void;
  editing?: boolean;
  className?: string;
  controlSize?: LayoutControlSize;
}
const EMPTY: LayoutPreference = { widgets: {} };
/** Controlled, SDK-free composition. Persistence and edit-mode ownership belong to the host. */
function Root({
  layout = 'single-column',
  layouts = CORE_LAYOUTS,
  sections,
  widgets = {},
  data,
  preference = EMPTY,
  onPreferenceChange,
  editing = false,
  className,
  controlSize,
}: LayoutComposerProps) {
  const definition = typeof layout === 'string' ? layouts.find((candidate) => candidate.id === layout) : layout;
  if (!definition) throw new Error(`Unknown dashboard layout: ${String(layout)}`);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const raw = useMemo(() => {
    const extras: RawEntry[] = Object.entries(widgets).flatMap(([section, entries]) =>
      entries.map(({ Component, widgetId }) => ({ widgetId, naturalSection: section, render: (data: unknown) => <Component data={data} /> })),
    );
    const entries = [...extras, ...buildCoreEntries(extractSectionElements(sections))];
    const ids = new Set<string>();
    for (const entry of entries) {
      if (ids.has(entry.widgetId)) throw new Error(`Duplicate layout widget id: ${entry.widgetId}`);
      ids.add(entry.widgetId);
    }
    return entries;
  }, [widgets, sections]);
  const entries = useMemo(
    () => buildDisplayEntries(raw, preference, new Set(definition.sections.map((section) => section.id))),
    [raw, preference, definition],
  );
  const handleEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !onPreferenceChange) return;
    const source = Object.entries(entries).find(([, group]) => group.some((entry) => entry.widgetId === active.id));
    const overId = String(over.id);
    const target = isSectionTailId(overId)
      ? getSectionIdFromTailId(overId)
      : (definition.sections.find((section) => section.id === overId)?.id ??
        Object.keys(entries).find((section) => entries[section]?.some((entry) => entry.widgetId === overId)));
    if (!source || !target || !definition.sections.some((section) => section.id === target)) return;
    const next = { widgets: { ...preference.widgets } };
    const remaining = Object.fromEntries(
      Object.entries(entries).map(([section, group]) => [
        section,
        group.filter((entry) => entry.widgetId !== active.id).map((entry) => entry.widgetId),
      ]),
    );
    const destination = remaining[target] ?? [];
    const index = destination.indexOf(overId);
    destination.splice(index < 0 ? destination.length : index, 0, String(active.id));
    remaining[target] = destination;
    for (const [section, group] of Object.entries(remaining))
      group.forEach((id, order) => {
        next.widgets[id] = { ...next.widgets[id], section, order };
      });
    onPreferenceChange(next);
  };
  const rendered = Object.fromEntries(
    definition.sections.map((section) => {
      const group = entries[section.id] ?? [];
      const content = group
        .filter((entry) => editing || !entry.hidden)
        .map((entry) =>
          editing ? (
            <SortableEntry
              key={entry.widgetId}
              widgetId={entry.widgetId}
              order={entry.order}
              hidden={entry.hidden}
              controlSize={controlSize}
              onToggleHidden={() =>
                onPreferenceChange?.({
                  widgets: { ...preference.widgets, [entry.widgetId]: { ...preference.widgets[entry.widgetId], hidden: !entry.hidden } },
                })
              }
            >
              {entry.render(data)}
            </SortableEntry>
          ) : (
            <Fragment key={entry.widgetId}>{entry.render(data)}</Fragment>
          ),
        );
      return [
        section.id,
        editing ? (
          <SectionDropzone section={section} items={group.map((entry) => entry.widgetId)}>
            {content}
          </SectionDropzone>
        ) : (
          content
        ),
      ];
    }),
  );
  const Component = definition.Component;
  return editing ? (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <Component sections={rendered} data={data} className={className} />
    </DndContext>
  ) : (
    <Component sections={rendered} data={data} className={className} />
  );
}
export const LayoutComposer = Object.assign(Root, { Entry: LayoutEntry });
