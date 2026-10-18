import type { ReactNode } from 'react';
import { JsonViewSection } from '../common/json-view-section';
import { MetadataSection } from '../common/metadata-section';
import { LayoutEntry } from './entry';
export interface DetailPageDefaultsOptions {
  metadata?: boolean;
  jsonView?: boolean;
  metadataHref?: string /** Host-owned extra presentation; no enterprise permissions implementation. */;
  extra?: ReactNode;
}
export function detailPageDefaultEntries(
  data: object,
  { metadata = true, jsonView = true, metadataHref, extra }: DetailPageDefaultsOptions = {},
): ReactNode {
  return (
    <>
      {metadata && (
        <LayoutEntry id="MetadataSection">
          <MetadataSection data={data} href={metadataHref} />
        </LayoutEntry>
      )}
      {jsonView && (
        <LayoutEntry id="JsonViewSection">
          <JsonViewSection data={data} />
        </LayoutEntry>
      )}
      {extra && <LayoutEntry id="extra">{extra}</LayoutEntry>}
    </>
  );
}
