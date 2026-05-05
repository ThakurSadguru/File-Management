import { useMemo } from 'react'
import { useFileContext } from '../context/useFileContext'

export function useFiles() {
  const ctx = useFileContext()

  const filesById = useMemo(() => new Map(ctx.files.map((f) => [f.id, f])), [ctx.files])

  return {
    files: ctx.files,
    filesById,
    isLoading: ctx.isLoading,
    addUploadedFiles: ctx.addUploadedFiles,
    moveFile: ctx.moveFile,
    copyFile: ctx.copyFile,
    renameItem: ctx.renameItem,
    deleteItem: ctx.deleteItem,
    openModal: ctx.openModal,
    startFakeLoading: ctx.startFakeLoading,
  }
}

