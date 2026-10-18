/** Editor-local icon set — lucide (ISC) glyphs re-rendered as React components.
 *  Kept local so the editor package stays icon-consistent without depending on
 *  the host app bundling lucide-react. Only the icons the editor ships. */
import type { ComponentType, SVGProps } from 'react';

export type EditorIconProps = SVGProps<SVGSVGElement>;
export type EditorIcon = ComponentType<EditorIconProps>;
type IconNode = ReadonlyArray<readonly [string, Record<string, string>]>;

const svg = (node: IconNode): EditorIcon =>
  function Icon({ width, height, ...props }: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width ?? 24}
        height={height ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {node.map(([tag, attrs], i) => {
          switch (tag) {
            case 'path':
              return <path key={i} {...attrs} />;
            case 'circle':
              return <circle key={i} {...attrs} />;
            case 'line':
              return <line key={i} {...attrs} />;
            case 'polyline':
              return <polyline key={i} {...attrs} />;
            case 'polygon':
              return <polygon key={i} {...attrs} />;
            case 'rect':
              return <rect key={i} {...attrs} />;
            case 'ellipse':
              return <ellipse key={i} {...attrs} />;
            default:
              return null;
          }
        })}
      </svg>
    );
  };
export const AppWindow = svg([
  ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
  ['path', { d: 'M10 4v4' }],
  ['path', { d: 'M2 8h20' }],
  ['path', { d: 'M6 4v4' }],
] as const);
export const ArrowDownToLine = svg([
  ['path', { d: 'M12 17V3' }],
  ['path', { d: 'm6 11 6 6 6-6' }],
  ['path', { d: 'M19 21H5' }],
] as const);
export const ArrowLeftToLine = svg([
  ['path', { d: 'M3 19V5' }],
  ['path', { d: 'm13 6-6 6 6 6' }],
  ['path', { d: 'M7 12h14' }],
] as const);
export const ArrowRightToLine = svg([
  ['path', { d: 'M17 12H3' }],
  ['path', { d: 'm11 18 6-6-6-6' }],
  ['path', { d: 'M21 5v14' }],
] as const);
export const ArrowUpToLine = svg([
  ['path', { d: 'M5 3h14' }],
  ['path', { d: 'm18 13-6-6-6 6' }],
  ['path', { d: 'M12 7v14' }],
] as const);
export const Badge = svg([
  [
    'path',
    {
      d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
    },
  ],
] as const);
export const Bold = svg([['path', { d: 'M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8' }]] as const);
export const BookOpen = svg([
  ['path', { d: 'M12 7v14' }],
  [
    'path',
    {
      d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
    },
  ],
] as const);
export const Braces = svg([
  ['path', { d: 'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1' }],
  ['path', { d: 'M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1' }],
] as const);
export const Check = svg([['path', { d: 'M20 6 9 17l-5-5' }]] as const);
export const CircleCheck = svg([
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['path', { d: 'm9 12 2 2 4-4' }],
] as const);
export const Code = svg([
  ['path', { d: 'm16 18 6-6-6-6' }],
  ['path', { d: 'm8 6-6 6 6 6' }],
] as const);
export const Columns3 = svg([
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ['path', { d: 'M9 3v18' }],
  ['path', { d: 'M15 3v18' }],
] as const);
export const ExternalLink = svg([
  ['path', { d: 'M15 3h6v6' }],
  ['path', { d: 'M10 14 21 3' }],
  ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }],
] as const);
export const FileText = svg([
  [
    'path',
    {
      d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z',
    },
  ],
  ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
  ['path', { d: 'M10 9H8' }],
  ['path', { d: 'M16 13H8' }],
  ['path', { d: 'M16 17H8' }],
] as const);
export const Folder = svg([
  [
    'path',
    {
      d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
    },
  ],
] as const);
export const FolderTree = svg([
  [
    'path',
    {
      d: 'M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z',
    },
  ],
  [
    'path',
    {
      d: 'M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z',
    },
  ],
  ['path', { d: 'M3 5a2 2 0 0 0 2 2h3' }],
  ['path', { d: 'M3 3v13a2 2 0 0 0 2 2h3' }],
] as const);
export const Frame = svg([
  ['line', { x1: '22', x2: '2', y1: '6', y2: '6' }],
  ['line', { x1: '22', x2: '2', y1: '18', y2: '18' }],
  ['line', { x1: '6', x2: '6', y1: '2', y2: '22' }],
  ['line', { x1: '18', x2: '18', y1: '2', y2: '22' }],
] as const);
export const GripVertical = svg([
  ['circle', { cx: '9', cy: '12', r: '1' }],
  ['circle', { cx: '9', cy: '5', r: '1' }],
  ['circle', { cx: '9', cy: '19', r: '1' }],
  ['circle', { cx: '15', cy: '12', r: '1' }],
  ['circle', { cx: '15', cy: '5', r: '1' }],
  ['circle', { cx: '15', cy: '19', r: '1' }],
] as const);
export const Heading1 = svg([
  ['path', { d: 'M4 12h8' }],
  ['path', { d: 'M4 18V6' }],
  ['path', { d: 'M12 18V6' }],
  ['path', { d: 'm17 12 3-2v8' }],
] as const);
export const Heading2 = svg([
  ['path', { d: 'M4 12h8' }],
  ['path', { d: 'M4 18V6' }],
  ['path', { d: 'M12 18V6' }],
  ['path', { d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1' }],
] as const);
export const Heading3 = svg([
  ['path', { d: 'M4 12h8' }],
  ['path', { d: 'M4 18V6' }],
  ['path', { d: 'M12 18V6' }],
  ['path', { d: 'M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2' }],
  ['path', { d: 'M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2' }],
] as const);
export const Highlighter = svg([
  ['path', { d: 'm9 11-6 6v3h9l3-3' }],
  ['path', { d: 'm22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4' }],
] as const);
export const Image = svg([
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
  ['circle', { cx: '9', cy: '9', r: '2' }],
  ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
] as const);
export const Inbox = svg([
  ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }],
  [
    'path',
    {
      d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    },
  ],
] as const);
export const Info = svg([
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['path', { d: 'M12 16v-4' }],
  ['path', { d: 'M12 8h.01' }],
] as const);
export const Italic = svg([
  ['line', { x1: '19', x2: '10', y1: '4', y2: '4' }],
  ['line', { x1: '14', x2: '5', y1: '20', y2: '20' }],
  ['line', { x1: '15', x2: '9', y1: '4', y2: '20' }],
] as const);
export const LayoutGrid = svg([
  ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }],
  ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }],
  ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }],
  ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }],
] as const);
export const Lightbulb = svg([
  [
    'path',
    {
      d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
    },
  ],
  ['path', { d: 'M9 18h6' }],
  ['path', { d: 'M10 22h4' }],
] as const);
export const Link = svg([
  ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
  ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
] as const);
export const List = svg([
  ['path', { d: 'M3 5h.01' }],
  ['path', { d: 'M3 12h.01' }],
  ['path', { d: 'M3 19h.01' }],
  ['path', { d: 'M8 5h13' }],
  ['path', { d: 'M8 12h13' }],
  ['path', { d: 'M8 19h13' }],
] as const);
export const ListChecks = svg([
  ['path', { d: 'M13 5h8' }],
  ['path', { d: 'M13 12h8' }],
  ['path', { d: 'M13 19h8' }],
  ['path', { d: 'm3 17 2 2 4-4' }],
  ['path', { d: 'm3 7 2 2 4-4' }],
] as const);
export const ListCollapse = svg([
  ['path', { d: 'M10 5h11' }],
  ['path', { d: 'M10 12h11' }],
  ['path', { d: 'M10 19h11' }],
  ['path', { d: 'm3 10 3-3-3-3' }],
  ['path', { d: 'm3 20 3-3-3-3' }],
] as const);
export const ListOrdered = svg([
  ['path', { d: 'M11 5h10' }],
  ['path', { d: 'M11 12h10' }],
  ['path', { d: 'M11 19h10' }],
  ['path', { d: 'M4 4h1v5' }],
  ['path', { d: 'M4 9h2' }],
  ['path', { d: 'M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02' }],
] as const);
export const ListTodo = svg([
  ['path', { d: 'M13 5h8' }],
  ['path', { d: 'M13 12h8' }],
  ['path', { d: 'M13 19h8' }],
  ['path', { d: 'm3 17 2 2 4-4' }],
  ['rect', { x: '3', y: '4', width: '6', height: '6', rx: '1' }],
] as const);
export const MessageCircle = svg([
  [
    'path',
    {
      d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
    },
  ],
] as const);
export const MessageSquarePlus = svg([
  [
    'path',
    {
      d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z',
    },
  ],
  ['path', { d: 'M12 8v6' }],
  ['path', { d: 'M9 11h6' }],
] as const);
export const Minus = svg([['path', { d: 'M5 12h14' }]] as const);
export const MousePointerClick = svg([
  ['path', { d: 'M14 4.1 12 6' }],
  ['path', { d: 'm5.1 8-2.9-.8' }],
  ['path', { d: 'm6 12-1.9 2' }],
  ['path', { d: 'M7.2 2.2 8 5.1' }],
  [
    'path',
    {
      d: 'M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z',
    },
  ],
] as const);
export const OctagonAlert = svg([
  ['path', { d: 'M12 16h.01' }],
  ['path', { d: 'M12 8v4' }],
  [
    'path',
    {
      d: 'M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z',
    },
  ],
] as const);
export const PanelTop = svg([
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ['path', { d: 'M3 9h18' }],
] as const);
export const Plus = svg([
  ['path', { d: 'M5 12h14' }],
  ['path', { d: 'M12 5v14' }],
] as const);
export const Quote = svg([
  [
    'path',
    {
      d: 'M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
    },
  ],
  [
    'path',
    {
      d: 'M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
    },
  ],
] as const);
export const Redo2 = svg([
  ['path', { d: 'm15 14 5-5-5-5' }],
  ['path', { d: 'M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13' }],
] as const);
export const Rows3 = svg([
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ['path', { d: 'M21 9H3' }],
  ['path', { d: 'M21 15H3' }],
] as const);
export const Send = svg([
  [
    'path',
    {
      d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
    },
  ],
  ['path', { d: 'm21.854 2.147-10.94 10.939' }],
] as const);
export const Sparkles = svg([
  [
    'path',
    {
      d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
    },
  ],
  ['path', { d: 'M20 2v4' }],
  ['path', { d: 'M22 4h-4' }],
  ['circle', { cx: '4', cy: '20', r: '2' }],
] as const);
export const SquareCode = svg([
  ['path', { d: 'm10 9-3 3 3 3' }],
  ['path', { d: 'm14 15 3-3-3-3' }],
  ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
] as const);
export const Strikethrough = svg([
  ['path', { d: 'M16 4H9a3 3 0 0 0-2.83 4' }],
  ['path', { d: 'M14 12a4 4 0 0 1 0 8H6' }],
  ['line', { x1: '4', x2: '20', y1: '12', y2: '12' }],
] as const);
export const Subscript = svg([
  ['path', { d: 'm4 5 8 8' }],
  ['path', { d: 'm12 5-8 8' }],
  [
    'path',
    {
      d: 'M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07',
    },
  ],
] as const);
export const Superscript = svg([
  ['path', { d: 'm4 19 8-8' }],
  ['path', { d: 'm12 19-8-8' }],
  [
    'path',
    {
      d: 'M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06',
    },
  ],
] as const);
export const Table = svg([
  ['path', { d: 'M12 3v18' }],
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
  ['path', { d: 'M3 9h18' }],
  ['path', { d: 'M3 15h18' }],
] as const);
export const Trash2 = svg([
  ['path', { d: 'M10 11v6' }],
  ['path', { d: 'M14 11v6' }],
  ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
  ['path', { d: 'M3 6h18' }],
  ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
] as const);
export const TriangleAlert = svg([
  ['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
  ['path', { d: 'M12 9v4' }],
  ['path', { d: 'M12 17h.01' }],
] as const);
export const Type = svg([
  ['path', { d: 'M12 4v16' }],
  ['path', { d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2' }],
  ['path', { d: 'M9 20h6' }],
] as const);
export const Underline = svg([
  ['path', { d: 'M6 4v6a6 6 0 0 0 12 0V4' }],
  ['line', { x1: '4', x2: '20', y1: '20', y2: '20' }],
] as const);
export const Undo2 = svg([
  ['path', { d: 'M9 14 4 9l5-5' }],
  ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11' }],
] as const);
export const Unlink = svg([
  [
    'path',
    {
      d: 'm18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71',
    },
  ],
  ['path', { d: 'm5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71' }],
  ['line', { x1: '8', x2: '8', y1: '2', y2: '5' }],
  ['line', { x1: '2', x2: '5', y1: '8', y2: '8' }],
  ['line', { x1: '16', x2: '16', y1: '19', y2: '22' }],
  ['line', { x1: '19', x2: '22', y1: '16', y2: '16' }],
] as const);
export const Workflow = svg([
  ['rect', { width: '8', height: '8', x: '3', y: '3', rx: '2' }],
  ['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4' }],
  ['rect', { width: '8', height: '8', x: '13', y: '13', rx: '2' }],
] as const);
export const X = svg([
  ['path', { d: 'M18 6 6 18' }],
  ['path', { d: 'm6 6 12 12' }],
] as const);
export const Code2 = svg([
  ['path', { d: 'm18 16 4-4-4-4' }],
  ['path', { d: 'm6 8-4 4 4 4' }],
  ['path', { d: 'm14.5 4-5 16' }],
] as const);
