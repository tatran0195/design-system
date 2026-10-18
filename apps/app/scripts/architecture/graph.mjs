/** Architectural fitness rules operate on module records, independently of the filesystem. */
export function moduleOwner(name) {
  return name.match(/^(features|entities)\/[^/]+/)?.[0] ?? name.split('/')[0];
}
export function inspectGraph(modules, contract) {
  const errors = [];
  const runtime = new Map();
  const features = new Map();
  for (const module of modules) {
    const from = moduleOwner(module.name);
    if (from.startsWith('features/') && !(from.slice(9) in contract.featureDependencies)) errors.push(`Unregistered feature owner: ${from}`);
    if (from.startsWith('entities/') && !(contract.entities ?? []).includes(from.slice(9))) errors.push(`Unregistered entity owner: ${from}`);
    runtime.set(module.name, []);
    if (
      !['app', 'routes', 'shared', 'integrations', 'widgets', 'features', 'entities'].includes(module.name.split('/')[0]) &&
      !contract.entries.includes(module.name)
    )
      errors.push(`Unowned module: ${module.name}`);
    const publicFile = /^(?:features|entities)\/[^/]+\/(?:index|api|model|pages|links|appearance|server)\.ts$/.test(module.name);
    if (publicFile) {
      const names = new Set();
      for (const item of module.exports) {
        if (item === '*') errors.push(`Wildcard public export: ${module.name}`);
        if (names.has(item)) errors.push(`Duplicate public export: ${module.name}: ${item}`);
        names.add(item);
      }
    }
    for (const edge of module.imports) {
      if (!edge.target) continue;
      const to = moduleOwner(edge.target);
      if (edge.missing) {
        errors.push(`Unresolved local import: ${module.name}: ${edge.source}`);
        continue;
      }
      if (from === 'shared' && !['shared'].includes(to) && !(edge.asset && edge.target.startsWith('../i18n/messages/')))
        errors.push(`Shared depends upward: ${module.name} -> ${edge.target}`);
      if (from === 'integrations' && !['shared', 'integrations'].includes(to))
        errors.push(`Integration depends upward: ${module.name} -> ${edge.target}`);
      if (from.startsWith('entities/') && !['shared', 'integrations'].includes(to) && !to.startsWith('entities/'))
        errors.push(`Entity depends upward: ${module.name} -> ${edge.target}`);
      if (from.startsWith('features/') && ['app', 'routes', 'widgets'].includes(to))
        errors.push(`Feature depends on composition: ${module.name} -> ${edge.target}`);
      if ((to.startsWith('features/') || to.startsWith('entities/')) && from !== to) {
        const rest = edge.target.slice(to.length + 1);
        if (!contract.publicEntries.includes(rest)) errors.push(`Private module access: ${module.name} -> ${edge.target}`);
      }
      if (!module.test && from.startsWith('features/') && to.startsWith('features/') && from !== to) {
        if (!(contract.featureDependencies[from.slice(9)] ?? []).includes(to.slice(9)))
          errors.push(`Undeclared feature dependency: ${from} -> ${to}`);
        if (!edge.typeOnly) {
          if (!features.has(from)) features.set(from, new Set());
          features.get(from).add(to);
        }
      }
      if (!module.test && !edge.typeOnly && !edge.asset && !edge.target.endsWith('routeTree.gen.ts')) runtime.get(module.name).push(edge.target);
      if (!module.test && edge.target.match(/\.(?:test|spec)\./)) errors.push(`Runtime imports tests: ${module.name} -> ${edge.target}`);
    }
  }
  function cycles(graph, label) {
    let index = 0;
    const indices = new Map(),
      low = new Map(),
      stack = [],
      active = new Set();
    function visit(v) {
      indices.set(v, index);
      low.set(v, index++);
      stack.push(v);
      active.add(v);
      for (const w of graph.get(v) ?? []) {
        if (!graph.has(w)) continue;
        if (!indices.has(w)) {
          visit(w);
          low.set(v, Math.min(low.get(v), low.get(w)));
        } else if (active.has(w)) low.set(v, Math.min(low.get(v), indices.get(w)));
      }
      if (low.get(v) === indices.get(v)) {
        let w;
        const group = [];
        do {
          w = stack.pop();
          active.delete(w);
          group.push(w);
        } while (w !== v);
        if (group.length > 1) errors.push(`${label}: ${group.sort().join(' <-> ')}`);
      }
    }
    for (const v of graph.keys()) if (!indices.has(v)) visit(v);
  }
  cycles(runtime, 'Runtime cycle');
  cycles(features, 'Feature cycle');
  return [...new Set(errors)];
}
