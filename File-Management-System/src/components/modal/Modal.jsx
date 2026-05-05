import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useFileContext } from "../../context/useFileContext";
import ImageViewer from "../gallery/ImageViewer";
import mammoth from "mammoth";
import { FileService } from "../../services/FileService";

function ModalFrame({ title, children, footer, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button
            className="icon-btn"
            type="button"
            aria-label="Close modal"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function FolderSelect({ defaultValue, inputRef, folders, excludeId }) {
  const options = folders.filter((f) => f.id !== excludeId);
  return (
    <select className="select" defaultValue={defaultValue} ref={inputRef}>
      {options.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}

function PreviewBody({ file }) {
  const [text, setText] = useState("");
  const [docxHtml, setDocxHtml] = useState("");

  if (!file || file.kind !== "file") return null;

  const type = file.type || "";
  const isImage = type === "image" || type.startsWith("image/");
  const isVideo = type === "video" || type.startsWith("video/");
  const isPdf = type === "pdf" || type === "application/pdf";
  const isText = type === "text" || type.startsWith("text/");
  const isDocx =
    type === "document" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  useEffect(() => {
    if (!isText) return;
    fetch(file.url)
      .then((res) => res.text())
      .then(setText)
      .catch(() => setText("Failed to load file"));
  }, [file.url, isText]);

  useEffect(() => {
    if (!isDocx) return;
    fetch(file.url)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
      .then((result) => setDocxHtml(result.value))
      .catch(() => setDocxHtml("Failed to load DOCX"));
  }, [file.url, isDocx]);

  if (isImage) return <ImageViewer src={file.url} alt={file.name} />;
  if (isVideo)
    return <video className="preview-video" src={file.url} controls />;
  if (isPdf)
    return (
      <iframe
        key={file.url}
        className="preview-pdf"
        title={file.name}
        src={file.url}
      />
    );
  if (isDocx)
    return (
      <div
        className="docx-preview"
        dangerouslySetInnerHTML={{ __html: docxHtml || "Loading..." }}
      />
    );
  if (isText) return <pre className="preview-text">{text || "Loading..."}</pre>;

  return <div className="muted">Preview not supported for this file type.</div>;
}

export default function Modal() {
  const {
    allFolders,
    modalData, // ✅ for bulk delete items list
    currentFolderId,
    selectedItem,
    modalType,
    isModalOpen,
    closeModal,
    openModal,
    createFolder,
    renameItem,
    deleteItem,
    moveFile,
    copyFile,
    removeFavorite,
  } = useFileContext();

  const nameRef = useRef(null);
  const folderRef = useRef(null);

  const title = useMemo(() => {
    if (!modalType) return "";
    if (modalType === "create") return "Create folder";
    if (modalType === "rename")
      return `Rename ${selectedItem?.kind === "folder" ? "folder" : "file"}`;
    if (modalType === "delete") return "Delete confirmation";
    if (modalType === "confirmBulkDelete") return "Delete items"; // ✅
    if (modalType === "move") return "Move item";
    if (modalType === "copy") return "Copy item";
    if (modalType === "preview") return "Preview";
    if (modalType === "favoriteAdded") return "Added to Favorites";
    if (modalType === "confirmRemoveFavorite") return "Remove from Favorites";
    if (modalType === "success") return "Success";
    if (modalType === "confirmRestore") return "Restore file";
    if (modalType === "confirmPermanentDelete") return "Delete permanently";
    if (modalType === "confirmEmptyTrash") return "Empty trash";
    return "Modal";
  }, [modalType, selectedItem?.kind]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const nameKey = `${modalType || "none"}:${selectedItem?.id || "none"}:${currentFolderId || "root"}`;

  const primary = async () => {
    if (modalType === "create") {
      const name = nameRef.current?.value || "";
      const ok = await createFolder({ name, parentId: currentFolderId });
      if (ok) {
        closeModal();
        openModal("success", { message: "Folder created successfully" });
      }
      return;
    }

    if (modalType === "confirmRemoveFavorite") {
      removeFavorite(selectedItem.id);
      closeModal();
      return;
    }

    if (modalType === "rename") {
      const name = nameRef.current?.value || "";
      const ok = await renameItem({ item: selectedItem, name });
      if (ok) closeModal();
      return;
    }

    if (modalType === "delete") {
      const ok = await deleteItem({ item: selectedItem });
      if (ok) closeModal();
      return;
    }

    // ✅ Bulk delete — iterates all selected items
    if (modalType === "confirmBulkDelete") {
      const items = modalData?.items ?? [];
      for (const item of items) {
        await deleteItem({ item });
      }
      closeModal();
      return;
    }

    if (modalType === "move") {
      const targetFolderId =
        folderRef.current?.value || currentFolderId || "root";
      const ok = await moveFile({
        fileId: selectedItem?.id,
        targetFolderId,
        item: selectedItem,
      });
      if (ok) {
        closeModal();
        openModal("success", { message: "Moved successfully" });
      }
      return;
    }

    if (modalType === "copy") {
      const targetFolderId =
        folderRef.current?.value || currentFolderId || "root";
      const ok = await copyFile({
        fileId: selectedItem?.id,
        targetFolderId,
        item: selectedItem,
      });
      if (ok) {
        closeModal();
        openModal("success", { message: "Copied successfully" });
      }
      return;
    }

    if (modalType === "confirmRestore") {
      try {
        await FileService.restore(selectedItem.id);
        closeModal();
      } catch {
        closeModal();
      }
      return;
    }

    if (modalType === "confirmPermanentDelete") {
      try {
        await FileService.deletePermanent(selectedItem.id);
        closeModal();
      } catch {
        closeModal();
      }
      return;
    }

    if (modalType === "confirmEmptyTrash") {
      const items = modalData?.items ?? [];
      try {
        await Promise.all(items.map((f) => FileService.deletePermanent(f.id)));
      } catch {
        // continue
      }
      closeModal();
      return;
    }
  };

  const footer = (() => {
    if (modalType === "preview") {
      return (
        <button className="btn" onClick={closeModal}>
          Close
        </button>
      );
    }

    if (modalType === "favoriteAdded" || modalType === "success") {
      return (
        <button className="btn primary" onClick={closeModal}>
          OK
        </button>
      );
    }

    const label =
      modalType === "create"
        ? "Create"
        : modalType === "rename"
          ? "Save"
          : modalType === "delete"
            ? "Delete"
            : modalType === "confirmBulkDelete" // ✅
              ? "Delete"
              : modalType === "confirmPermanentDelete"
                ? "Delete Forever"
                : modalType === "confirmEmptyTrash"
                  ? "Empty Trash"
                  : modalType === "confirmRestore"
                    ? "Restore"
                    : modalType === "move"
                      ? "Move"
                      : modalType === "copy"
                        ? "Copy"
                        : modalType === "confirmRemoveFavorite"
                          ? "Remove"
                          : "OK";

    // ✅ confirmBulkDelete is also danger
    const danger =
      modalType === "delete" ||
      modalType === "confirmRemoveFavorite" ||
      modalType === "confirmBulkDelete";
    modalType === "confirmPermanentDelete" || modalType === "confirmEmptyTrash";

    return (
      <>
        <button className="btn" onClick={closeModal}>
          Cancel
        </button>
        <button
          className={`btn ${danger ? "danger" : "primary"}`}
          onClick={primary}
        >
          {label}
        </button>
      </>
    );
  })();

  return (
    <ModalFrame title={title} onClose={closeModal} footer={footer}>
      {modalType === "create" && (
        <div className="form">
          <label className="field">
            <span className="label">Folder name</span>
            <input
              key={nameKey}
              ref={nameRef}
              className="input"
              defaultValue=""
              placeholder="New folder"
              autoFocus
            />
          </label>
          <div className="muted">Created inside your current folder.</div>
        </div>
      )}

      {modalType === "rename" && (
        <div className="form">
          <label className="field">
            <span className="label">New name</span>
            <input
              key={nameKey}
              ref={nameRef}
              className="input"
              defaultValue={selectedItem?.name || ""}
              autoFocus
            />
          </label>
        </div>
      )}

      {modalType === "delete" && (
        <div className="form">
          <div className="confirm">
            Delete <b>{selectedItem?.name}</b>?
          </div>
          <div className="muted">
            {selectedItem?.kind === "folder"
              ? "This will also remove all nested folders and files."
              : "This action cannot be undone."}
          </div>
        </div>
      )}

      {/* ✅ Bulk delete confirmation body */}
      {modalType === "confirmBulkDelete" && (
        <div className="form">
          <div className="confirm">
            Delete <b>{modalData?.items?.length ?? 0} item(s)</b>?
          </div>
          <div className="muted">
            This will permanently remove all selected files and folders. This
            action cannot be undone.
          </div>
        </div>
      )}

      {(modalType === "move" || modalType === "copy") && (
        <div className="form">
          <div className="muted">Select destination folder.</div>
          <FolderSelect
            defaultValue={currentFolderId || "root"}
            inputRef={folderRef}
            folders={allFolders}
            excludeId={
              selectedItem?.kind === "folder" ? selectedItem?.id : null
            }
          />
        </div>
      )}

      {modalType === "preview" && (
        <div className="preview">
          <div className="preview-head">
            <div className="preview-name">{selectedItem?.name}</div>
            <div className="preview-sub">
              {selectedItem?.kind === "file" ? selectedItem.type : ""}
            </div>
          </div>
          <PreviewBody file={selectedItem} />
        </div>
      )}

      {modalType === "success" && (
        <div className="form">
          <div className="confirm">
            {selectedItem?.message || "Action completed"}
          </div>
        </div>
      )}

      {modalType === "favoriteAdded" && (
        <div className="form">
          <div className="confirm">Added to favorites ❤️</div>
        </div>
      )}

      {modalType === "confirmRestore" && (
        <div className="form">
          <div className="confirm">
            Restore <b>{selectedItem?.name}</b>?
          </div>
          <div className="muted">
            The file will be moved back to its original location.
          </div>
        </div>
      )}

      {modalType === "confirmPermanentDelete" && (
        <div className="form">
          <div className="confirm">
            Permanently delete <b>{selectedItem?.name}</b>?
          </div>
          <div className="muted">
            This cannot be undone. The file will be removed forever.
          </div>
        </div>
      )}

      {modalType === "confirmEmptyTrash" && (
        <div className="form">
          <div className="confirm">Empty the entire recycle bin?</div>
          <div className="muted">
            {modalData?.items?.length ?? 0} item(s) will be permanently deleted.
            This cannot be undone.
          </div>
        </div>
      )}

      {modalType === "confirmRemoveFavorite" && (
        <div className="form">
          <div className="confirm">
            Remove <b>{selectedItem?.name}</b> from favorites?
          </div>
        </div>
      )}
    </ModalFrame>
  );
}
