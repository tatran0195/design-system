export interface SiteLinkContext {
  projectId: string;
  lang?: string;
  defaultLanguage?: string;
  version?: string;
}
export interface MarkdownProps {
  content: string;
  className?: string;
  site?: SiteLinkContext;
}
