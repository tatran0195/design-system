import { createContext } from 'react';

/** Shared with React node-view portals so review mode also locks MDX attributes. */
export const EditorReadOnlyContext = createContext(false);
