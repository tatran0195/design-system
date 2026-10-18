// Pinned upstream HTTP paths; no Nibleaf backend implementation is bundled.
import { endpoint } from '@/integrations/nibleaf/transport';
export const api = {
  app: {
    members: {
      ...endpoint('/api/app/members'),
      ':id': {
        ...endpoint('/api/app/members/:id'),
        role: {
          ...endpoint('/api/app/members/:id/role'),
        },
      },
      invite: {
        ...endpoint('/api/app/members/invite'),
      },
    },
    notifications: {
      ...endpoint('/api/app/notifications'),
      read: {
        ...endpoint('/api/app/notifications/read'),
      },
      'unread-count': {
        ...endpoint('/api/app/notifications/unread-count'),
      },
    },
    projects: {
      ...endpoint('/api/app/projects'),
      ':id': {
        ...endpoint('/api/app/projects/:id'),
        'theme-template': {
          ...endpoint('/api/app/projects/:id/theme-template'),
          import: {
            ...endpoint('/api/app/projects/:id/theme-template/import'),
          },
        },
      },
      ':projectId': {
        addons: {
          ...endpoint('/api/app/projects/:projectId/addons'),
          ':addonId': {
            ...endpoint('/api/app/projects/:projectId/addons/:addonId'),
            activate: {
              ...endpoint('/api/app/projects/:projectId/addons/:addonId/activate'),
            },
            deactivate: {
              ...endpoint('/api/app/projects/:projectId/addons/:addonId/deactivate'),
            },
          },
        },
        ai: {
          ...endpoint('/api/app/projects/:projectId/ai'),
        },
        analytics: {
          ...endpoint('/api/app/projects/:projectId/analytics'),
        },
        'api-keys': {
          ...endpoint('/api/app/projects/:projectId/api-keys'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/api-keys/:id'),
            rotate: {
              ...endpoint('/api/app/projects/:projectId/api-keys/:id/rotate'),
            },
          },
        },
        assets: {
          confirm: {
            ...endpoint('/api/app/projects/:projectId/assets/confirm'),
          },
          presign: {
            ...endpoint('/api/app/projects/:projectId/assets/presign'),
          },
        },
        branches: {
          ...endpoint('/api/app/projects/:projectId/branches'),
          ':id': {
            merge: {
              ...endpoint('/api/app/projects/:projectId/branches/:id/merge'),
            },
          },
        },
        comments: {
          ...endpoint('/api/app/projects/:projectId/comments'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/comments/:id'),
          },
        },
        deployments: {
          ...endpoint('/api/app/projects/:projectId/deployments'),
          ':id': {
            rollback: {
              ...endpoint('/api/app/projects/:projectId/deployments/:id/rollback'),
            },
          },
          changes: {
            ...endpoint('/api/app/projects/:projectId/deployments/changes'),
          },
        },
        domains: {
          ...endpoint('/api/app/projects/:projectId/domains'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/domains/:id'),
            primary: {
              ...endpoint('/api/app/projects/:projectId/domains/:id/primary'),
            },
            verify: {
              ...endpoint('/api/app/projects/:projectId/domains/:id/verify'),
            },
          },
        },
        exports: {
          ...endpoint('/api/app/projects/:projectId/exports'),
          ':id': {
            artifacts: {
              ':artifactId': {
                download: {
                  ...endpoint('/api/app/projects/:projectId/exports/:id/artifacts/:artifactId/download'),
                },
              },
            },
            cancel: {
              ...endpoint('/api/app/projects/:projectId/exports/:id/cancel'),
            },
          },
          schedules: {
            ...endpoint('/api/app/projects/:projectId/exports/schedules'),
            ':scheduleId': {
              ...endpoint('/api/app/projects/:projectId/exports/schedules/:scheduleId'),
              run: {
                ...endpoint('/api/app/projects/:projectId/exports/schedules/:scheduleId/run'),
              },
            },
          },
        },
        git: {
          ...endpoint('/api/app/projects/:projectId/git'),
          authorize: {
            ...endpoint('/api/app/projects/:projectId/git/authorize'),
          },
          conflicts: {
            ':conflictId': {
              resolve: {
                ...endpoint('/api/app/projects/:projectId/git/conflicts/:conflictId/resolve'),
              },
            },
          },
          connection: {
            ...endpoint('/api/app/projects/:projectId/git/connection'),
          },
          operations: {
            ...endpoint('/api/app/projects/:projectId/git/operations'),
          },
          'webhook-secret': {
            ...endpoint('/api/app/projects/:projectId/git/webhook-secret'),
          },
        },
        integrations: {
          ...endpoint('/api/app/projects/:projectId/integrations'),
          ':providerId': {
            ...endpoint('/api/app/projects/:projectId/integrations/:providerId'),
            'delete-confirmation': {
              ...endpoint('/api/app/projects/:projectId/integrations/:providerId/delete-confirmation'),
            },
            activate: { ...endpoint('/api/app/projects/:projectId/integrations/:providerId/activate') },
            deactivate: { ...endpoint('/api/app/projects/:projectId/integrations/:providerId/deactivate') },
            verify: {
              ...endpoint('/api/app/projects/:projectId/integrations/:providerId/verify'),
            },
          },
        },
        languages: {
          ...endpoint('/api/app/projects/:projectId/languages'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/languages/:id'),
          },
        },
        members: {
          ...endpoint('/api/app/projects/:projectId/members'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/members/:id'),
            role: {
              ...endpoint('/api/app/projects/:projectId/members/:id/role'),
            },
          },
          invitations: {
            ':id': {
              ...endpoint('/api/app/projects/:projectId/members/invitations/:id'),
            },
          },
          invite: {
            ...endpoint('/api/app/projects/:projectId/members/invite'),
          },
          'transfer-ownership': {
            ...endpoint('/api/app/projects/:projectId/members/transfer-ownership'),
          },
        },
        openapi: {
          ...endpoint('/api/app/projects/:projectId/openapi'),
          sync: {
            ...endpoint('/api/app/projects/:projectId/openapi/sync'),
          },
        },
        pages: {
          ...endpoint('/api/app/projects/:projectId/pages'),
          ':id': {
            ...endpoint('/api/app/projects/:projectId/pages/:id'),
          },
          reorder: {
            ...endpoint('/api/app/projects/:projectId/pages/reorder'),
          },
        },
        'reader-access': {
          ...endpoint('/api/app/projects/:projectId/reader-access'),
          audiences: {
            ...endpoint('/api/app/projects/:projectId/reader-access/audiences'),
            ':audienceId': {
              ...endpoint('/api/app/projects/:projectId/reader-access/audiences/:audienceId'),
            },
          },
          'emergency-revoke': {
            ...endpoint('/api/app/projects/:projectId/reader-access/emergency-revoke'),
          },
          jwt: {
            ...endpoint('/api/app/projects/:projectId/reader-access/jwt'),
            test: {
              ...endpoint('/api/app/projects/:projectId/reader-access/jwt/test'),
            },
          },
          mode: {
            ...endpoint('/api/app/projects/:projectId/reader-access/mode'),
          },
          readers: {
            ':readerId': {
              revoke: {
                ...endpoint('/api/app/projects/:projectId/reader-access/readers/:readerId/revoke'),
              },
            },
            invite: {
              ...endpoint('/api/app/projects/:projectId/reader-access/readers/invite'),
            },
          },
        },
        settings: {
          ...endpoint('/api/app/projects/:projectId/settings'),
          git: {
            import: {
              ...endpoint('/api/app/projects/:projectId/settings/git/import'),
            },
            'webhook-secret': {
              ...endpoint('/api/app/projects/:projectId/settings/git/webhook-secret'),
            },
          },
          import: {
            ghost: {
              ...endpoint('/api/app/projects/:projectId/settings/import/ghost'),
            },
            mintlify: {
              ...endpoint('/api/app/projects/:projectId/settings/import/mintlify'),
            },
          },
          search: {
            ...endpoint('/api/app/projects/:projectId/settings/search'),
            diagnostics: {
              ...endpoint('/api/app/projects/:projectId/settings/search/diagnostics'),
            },
            reindex: {
              ...endpoint('/api/app/projects/:projectId/settings/search/reindex'),
            },
          },
        },
      },
    },
    workspace: {
      ...endpoint('/api/app/workspace'),
      analytics: {
        ...endpoint('/api/app/workspace/analytics'),
      },
    },
  },
  public: {
    git: {
      previews: {
        ':token': {
          ...endpoint('/api/public/git/previews/:token'),
        },
      },
    },
    invitations: {
      ':id': {
        ...endpoint('/api/public/invitations/:id'),
      },
    },
    meta: {
      ...endpoint('/api/public/meta'),
    },
    sites: {
      ':id': {
        ...endpoint('/api/public/sites/:id'),
        answer: {
          ...endpoint('/api/public/sites/:id/answer'),
        },
        changelog: {
          ...endpoint('/api/public/sites/:id/changelog'),
        },
        events: {
          ...endpoint('/api/public/sites/:id/events'),
        },
        page: {
          ...endpoint('/api/public/sites/:id/page'),
        },
        search: {
          ...endpoint('/api/public/sites/:id/search'),
        },
      },
    },
  },
};
