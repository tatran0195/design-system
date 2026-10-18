import { Slot } from '@cms/ui';
import type React from 'react';
import { createRoot } from 'react-dom/client';
import { RootLayout, type RootLayoutSlots } from '../src/layouts/root';
import './style.css';

const SidebarSlot: RootLayoutSlots['sidebar'] = () => (
  <aside className="demo-sidebar">
    <a className="demo-sidebar-brand" href="/">
      Docs Workspace
    </a>
    <p className="demo-label">Workspace</p>
    <nav aria-label="Documentation">
      <a href="#overview">Overview</a>
      <a className="demo-active" href="#layouts">
        Layouts
      </a>
      <a href="#extensions">Extensions</a>
    </nav>
    <div className="demo-sidebar-foot">Internal knowledge base</div>
  </aside>
);

const MainNavSlot: RootLayoutSlots['mainNav'] = () => (
  <div className="demo-main-nav">
    <Slot.Root className="demo-brand-link">
      <a href="/" aria-label="CMS documentation home">
        Docs Workspace
      </a>
    </Slot.Root>
    <span className="demo-nav-path">Reader / Layouts</span>
    <button className="demo-search" type="button">
      <span className="demo-search-label">Search documentation</span> <kbd>Ctrl K</kbd>
    </button>
  </div>
);

const ContentMenuSlot: RootLayoutSlots['contentMenu'] = () => (
  <nav className="demo-toc" aria-label="On this page">
    <p className="demo-label">On this page</p>
    <a className="demo-toc-active" href="#composition">
      Composition
    </a>
    <a href="#custom-slots">Custom slots</a>
    <a href="#design-system">Design system</a>
  </nav>
);

const MainContentSlot: RootLayoutSlots['mainContent'] = ({ children, slots }) => (
  <section className="demo-reader">
    <div className="demo-reader-head">{slots?.mainNav && <slots.mainNav />}</div>
    <div className="demo-reader-grid">
      <main className="demo-article">{children}</main>
      {slots?.contentMenu && (
        <aside className="demo-aside">
          <slots.contentMenu />
        </aside>
      )}
    </div>
  </section>
);

const AiAssistantSlot: RootLayoutSlots['aiAssistant'] = () => null;
const ArticleJsonLdSlot: RootLayoutSlots['articleJsonLd'] = () => null;
const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

function DemoPage() {
  return (
    <RootLayout
      ProvidersComponent={Providers}
      slots={{
        sidebar: SidebarSlot,
        mainContent: MainContentSlot,
        mainNav: MainNavSlot,
        contentMenu: ContentMenuSlot,
        aiAssistant: AiAssistantSlot,
        articleJsonLd: ArticleJsonLdSlot,
      }}
    >
      <p className="demo-eyebrow">READER SYSTEM</p>
      <h1>Composable reader layouts</h1>
      <p className="demo-lede">Swap navigation, page chrome, and supporting regions without forking the reader structure.</p>
      <hr />
      <section id="composition">
        <h2>Composition</h2>
        <p>Each layout region is a typed component slot. Unspecified regions keep their standard implementation.</p>
        <pre>
          <code>{'<Layout slots={{ header: CustomHeader }} />'}</code>
        </pre>
      </section>
      <section id="custom-slots">
        <h2>Custom slots</h2>
        <p>Replace navigation and supporting regions independently while preserving the reader page structure.</p>
      </section>
      <section id="design-system">
        <h2>Design system</h2>
        <p>The layout owns placement; each slot owns its markup and behavior.</p>
      </section>
    </RootLayout>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Demo root element is missing');
createRoot(root).render(<DemoPage />);
