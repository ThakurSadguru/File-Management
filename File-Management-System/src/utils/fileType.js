export const FILE_TYPE_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'folder', label: 'Folders' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'text', label: 'Text' },
  { id: 'document', label: 'Documents' },
]

export function getItemTypeLabel(item) {
  if (!item) return ''
  if (item.kind === 'folder') return 'Folder'
  const t = item.type
  if (t === 'image') return 'Image'
  if (t === 'video') return 'Video'
  if (t === 'pdf') return 'PDF'
  if (t === 'text') return 'Text'
  if (t === 'document') return 'Document'
  return 'File'
}

export function isPreviewable(file) {
  if (!file) return false
  return ['image', 'video', 'pdf', 'text'].includes(file.type)
}

