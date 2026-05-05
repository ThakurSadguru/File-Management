import { useMemo } from 'react'
import { useFileContext } from '../context/useFileContext'

export function useFolders() {
  const ctx = useFileContext()

  const foldersById = useMemo(() => new Map(ctx.folders.map((f) => [f.id, f])), [ctx.folders])

  return {
    folders: ctx.folders,
    foldersById,
    currentFolderId: ctx.currentFolderId,
    currentFolder: ctx.currentFolder,
    breadcrumbFolders: ctx.breadcrumbFolders,
    openFolder: ctx.openFolder,
    createFolder: ctx.createFolder,
    renameItem: ctx.renameItem,
    deleteItem: ctx.deleteItem,
    openModal: ctx.openModal,
  }
}

