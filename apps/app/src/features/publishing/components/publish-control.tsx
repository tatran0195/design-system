import { Rocket } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/entities/project/model';
import { useDeployments } from '@/features/publishing/api/queries';
import { DeployPipeline } from '@/features/publishing/components/deploy-pipeline';
import { PublishModal } from '@/features/publishing/components/publish-modal';
import { useT } from '@/shared/i18n/react';
import { Button } from '@/shared/ui/button';
export function PublishControl({ project, initialPublishOpen = false }: { project: Project; initialPublishOpen?: boolean }) {
  const [publishOpen, setPublishOpen] = useState(initialPublishOpen);
  const [deployOpen, setDeployOpen] = useState(false);
  const [publishedDeploymentId, setPublishedDeploymentId] = useState<string | null>(null);
  const t = useT();

  const deployments = useDeployments(project.id, { pollIntervalMs: 1500 });
  const latest = deployments.data?.[0];
  const building = latest?.status === 'PENDING' || latest?.status === 'BUILDING';

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label={building ? t('project.publishing') : t('project.publish')}
        disabled={building}
        onClick={() => setPublishOpen(true)}
        size="sm"
      >
        <Rocket className="size-3.5" />
        <span className="hidden sm:inline">{building ? t('project.publishing') : t('project.publish')}</span>
      </Button>

      <PublishModal
        onOpenChange={setPublishOpen}
        onPublished={(deployment) => {
          setPublishedDeploymentId(deployment.id);
          setDeployOpen(true);
        }}
        open={publishOpen}
        project={project}
      />
      <DeployPipeline onOpenChange={setDeployOpen} open={deployOpen} project={project} trackedDeploymentId={publishedDeploymentId} />
    </div>
  );
}
