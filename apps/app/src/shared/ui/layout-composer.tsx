import type { LayoutComponentProps, LayoutDefinition } from '@cms/dashboard';

export { LayoutComposer } from '@cms/dashboard';

function WorkspaceLayout({ sections }: LayoutComponentProps) {
  return (
    <div className="flex flex-col gap-6">
      {sections.header}
      {sections.metrics}
      {sections.traffic}
      {sections.content}
    </div>
  );
}

function OverviewLayout({ sections }: LayoutComponentProps) {
  return (
    <div className="w-full px-6 py-8 xl:px-10">
      {sections.header}
      {sections.notices}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        {sections.live}
        {sections.activity}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{sections.metrics}</div>
      <div className="mt-6">{sections.traffic}</div>
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        {sections.content}
        {sections.sidebar}
      </div>
    </div>
  );
}

export const workspaceLayout: LayoutDefinition = {
  id: 'app:workspace',
  sections: [{ id: 'header' }, { id: 'metrics' }, { id: 'traffic' }, { id: 'content' }],
  Component: WorkspaceLayout,
};

export const overviewLayout: LayoutDefinition = {
  id: 'app:overview',
  sections: [
    { id: 'header' },
    { id: 'notices' },
    { id: 'live' },
    { id: 'activity' },
    { id: 'metrics' },
    { id: 'traffic' },
    { id: 'content' },
    { id: 'sidebar' },
  ],
  Component: OverviewLayout,
};
