// Sample-only, process-local state. No network or persistent credentials.
export function createMockData() {
  const stamp = '2026-10-16T09:00:00.000Z';
  const user = {
    id: 'design-user',
    name: 'Alex Morgan',
    email: 'alex@company.test',
    emailVerified: true,
    image: null,
    role: 'user',
    createdAt: stamp,
    updatedAt: stamp,
  };
  const organization = { id: 'design-workspace', name: 'Product workspace', slug: 'product', logo: null, createdAt: stamp };
  const member = { id: 'design-member', organizationId: organization.id, userId: user.id, role: 'owner', createdAt: stamp, user };
  const projects = [
    { id: 'design-handbook', name: 'Company handbook', slug: 'handbook', description: 'Everything our team needs to do great work.', icon: '📘' },
    {
      id: 'design-engineering',
      name: 'Engineering',
      slug: 'engineering',
      description: 'Architecture, conventions and shared knowledge.',
      icon: '⚡',
    },
  ].map((p) => ({
    ...p,
    organizationId: organization.id,
    config: { styling: { theme: 'light', radius: 'rounded' } },
    createdAt: stamp,
    updatedAt: stamp,
    _count: { pages: 3, deployments: 1, domains: 0 },
  }));
  const languages = (id) => [
    {
      id: `${id}-en`,
      projectId: id,
      code: 'en',
      label: 'English',
      direction: 'LTR',
      isDefault: true,
      enabled: true,
      config: null,
      translation: null,
      position: 0,
    },
    {
      id: `${id}-ar`,
      projectId: id,
      code: 'ar',
      label: 'العربية',
      direction: 'RTL',
      isDefault: false,
      enabled: true,
      config: null,
      translation: null,
      position: 1,
    },
  ];
  const pages = projects.flatMap((p) =>
    ['Welcome', 'Getting started', 'Working together'].map((title, index) => ({
      id: `${p.id}-page-${index}`,
      projectId: p.id,
      languageId: `${p.id}-en`,
      branchId: `${p.id}-main`,
      parentId: null,
      title,
      slug: index === 0 ? 'welcome' : title.toLowerCase().replaceAll(' ', '-'),
      path: index === 0 ? 'welcome' : title.toLowerCase().replaceAll(' ', '-'),
      kind: 'PAGE',
      icon: null,
      description: 'A shared place for clear, useful documentation.',
      hidden: false,
      position: index,
      order: index,
      translationKey: `article-${index}`,
      content: `# ${title}\n\nA place for everything your team knows.\n\n## Make it yours\n\nWrite clearly, share context, and keep useful knowledge close to the work.\n\n- Add your team's conventions\n- Link related documents\n- Publish when you are ready\n\n> This preview uses local sample data, not a real workspace.`,
      config: null,
      createdAt: stamp,
      updatedAt: stamp,
    })),
  );
  const initialProjects = structuredClone(projects);
  const initialPages = structuredClone(pages);
  const session = {
    user,
    session: {
      id: 'design-session',
      token: 'local-design-token-not-a-credential',
      userId: user.id,
      activeOrganizationId: organization.id,
      impersonatedBy: null,
      createdAt: stamp,
      updatedAt: stamp,
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
  };
  const summary = {
    provider: 'relational',
    availability: 'complete',
    range: '30d',
    timezone: 'UTC',
    totalViews: 1248,
    uniqueVisitors: 386,
    timeseries: Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 3).padStart(2, '0')}`, views: 32 + i * 5 + (i % 3) * 11 })),
    referrers: [
      { referrer: 'Direct', views: 850 },
      { referrer: 'Internal search', views: 398 },
    ],
    devices: [
      { device: 'desktop', count: 1020 },
      { device: 'mobile', count: 228 },
    ],
    ai: { answersCompleted: 0, answersFailed: 0, promptTokens: 0, completionTokens: 0, costMicros: 0, averageLatencyMs: 0 },
    topPages: [{ path: 'welcome', project: 'Company handbook', views: 620 }],
    topSearches: [],
    languages: [{ language: 'en', views: 1248 }],
    engagement: { engagedViews: 850, averageEngagementMs: 48_000 },
    searches: { total: 82, zeroResults: 4, clickedResults: 62, averageLatencyMs: 12, queryTerms: 'redacted', topTerms: [] },
    noAnswerReasons: [],
    byProject: projects.map((p, i) => ({ projectId: p.id, name: p.name, color: i ? '#14b8a6' : '#6366f1', views: i ? 428 : 820 })),
  };

  return { stamp, user, organization, member, projects, languages, pages, initialProjects, initialPages, session, summary };
}
