'use client';

import { createNodeClusters } from '@/utils/workflow-diagram-utils';
import type { WorkflowDiagramCommonProps } from '../../..';
import { WorkflowDiagramLegend } from '../Common/Legend';
import { WorkflowDiagramListDepth } from './Depth';

export const WorkflowDiagramList = ({ workflow, hideLegend = false }: WorkflowDiagramCommonProps) => {
  const clusters = createNodeClusters(workflow.steps);

  return (
    <div className="flex flex-col gap-docs_1 my-docs_1 w-fit">
      <div className="workflow-list-diagram flex flex-col gap-docs_0.5 w-fit">
        {Object.entries(clusters).map(([depth, cluster]) => (
          <WorkflowDiagramListDepth cluster={cluster} key={depth} />
        ))}
      </div>
      <WorkflowDiagramLegend hideLegend={hideLegend} />
    </div>
  );
};
