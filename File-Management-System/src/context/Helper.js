export function toFolderItem(folder) {
  return { ...folder, kind: "folder" };
}

export function toFileItem(file) {
  return { ...file, kind: "file" };
}

export function getFolderAncestors(folders, folderId) {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain = [];
  let cur = byId.get(folderId) || null;
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : null;
  }
  return chain;
}

export function collectFolderDescendants(folders, folderId) {
  const childrenByParent = new Map();
  for (const f of folders) {
    const key = f.parentId ?? "__root__";
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(f);
  }
  const stack = [folderId];
  const all = new Set();
  while (stack.length) {
    const id = stack.pop();
    if (!id || all.has(id)) continue;
    all.add(id);
    const children = childrenByParent.get(id) || [];
    for (const c of children) stack.push(c.id);
  }
  return all;
}