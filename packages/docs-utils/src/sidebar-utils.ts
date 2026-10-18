import pkg from 'slugify';

const { default: slugify } = pkg;

export function getSectionId(path: string[]) {
  return path.map((p) => slugify(p.trim().toLowerCase())).join('_');
}
