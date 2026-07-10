import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  addTagToContent as apiAddTagToContent,
  createContent as apiCreateContent,
  createTag as apiCreateTag,
  type Content,
  type ContentType,
  type Tag,
} from "../api/client";

import TesseraDetail from "./TesseraDetail";

const MAX_FILE_SIZE_MB = 500;
const acceptedFileTypes = ".md,.pdf,.png,.jpg,.jpeg,.mp3,.mp4";
const API_BASE = "http://localhost:3000";

function getContentType(fileName: string): ContentType | null {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "md") return "Markdown";
  if (extension === "pdf") return "PDF";
  if (["png", "jpg", "jpeg"].includes(extension || "")) return "Image";
  if (extension === "mp3") return "Audio";
  if (extension === "mp4") return "Video";

  return null;
}

function FilePanel() {
  const { content, tags, currentWorkspace, loading, refreshWorkspaceData } =
    useWorkspace();

  const tagsPickerRef = useRef<HTMLDivElement>(null);

  const [selectedTessera, setSelectedTessera] = useState<Content | null>(null);

  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");

  const [editingTags, setEditingTags] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [formWarning, setFormWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (tagsPickerRef.current && !tagsPickerRef.current.contains(target)) {
        setEditingTags(false);
        setTagSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const resetAddFileModal = () => {
    setShowAddFileModal(false);
    setSelectedFile(null);
    setFileTitle("");
    setFileDescription("");
    setEditingTags(false);
    setTagSearch("");
    setSelectedTags([]);
    setFormWarning("");
    setSubmitting(false);
  };

  const availableTags = tags.filter(
    (tag) =>
      !selectedTags.some((selectedTag) => selectedTag.TagID === tag.TagID) &&
      tag.TagName.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const tagAlreadyExists = tags.some(
    (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
  );

  const addTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag]);
    setTagSearch("");
    setFormWarning("");
  };

  const createTag = async () => {
    if (tagSearch.trim() === "" || !currentWorkspace) return;

    const existingTag = tags.find(
      (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
    );

    if (existingTag) {
      addTag(existingTag);
      return;
    }

    try {
      const newTag = await apiCreateTag({
        WorkspaceID: currentWorkspace.WorkspaceID,
        TagName: tagSearch.trim(),
        HexColor: "#9B5DE5",
      });

      await refreshWorkspaceData();
      setSelectedTags([...selectedTags, newTag]);
      setTagSearch("");
      setFormWarning("");
    } catch (err) {
      console.error("Failed to create tag:", err);
      setFormWarning("Failed to create tag. Please try again.");
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
  };

  const getMissingFieldsMessage = () => {
    if (!selectedFile) return "Choose a file before adding this tessera.";
    if (fileTitle.trim() === "") return "Add a display name before saving.";
    if (selectedTags.length === 0) {
      return "Add at least one tag before saving this tessera.";
    }

    return "";
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }

    return uploadResponse.json() as Promise<{
      filePath: string;
      originalName: string;
    }>;
  };

  const addFile = async () => {
    const missingFieldsMessage = getMissingFieldsMessage();

    if (missingFieldsMessage) {
      setFormWarning(missingFieldsMessage);
      return;
    }

    if (!selectedFile || !currentWorkspace) return;

    const contentType = getContentType(selectedFile.name);

    if (!contentType) {
      setFormWarning("Unsupported file type.");
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setFormWarning(
        "This file is over 500 MB. You can still add it, but it may take longer to process and take up more storage."
      );
    }

    let textContent: string | null = null;

    if (contentType === "Markdown") {
      textContent = await selectedFile.text();

      if (textContent.trim() === "") {
        setFormWarning("Markdown content cannot be blank.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const uploadedFile = await uploadFile(selectedFile);

      const newContent = await apiCreateContent({
        WorkspaceID: currentWorkspace.WorkspaceID,
        Title: fileTitle.trim(),
        ContentType: contentType,
        TextContent: textContent,
        FilePath: uploadedFile.filePath,
        Description: fileDescription.trim(),
      });

      await Promise.all(
        selectedTags.map((tag) =>
          apiAddTagToContent(newContent.ContentID, tag.TagID)
        )
      );

      await refreshWorkspaceData();
      resetAddFileModal();
    } catch (err) {
      console.error("Failed to add tessera:", err);
      setFormWarning("Failed to save tessera. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <aside className="file-panel">
        <div className="file-header">
          <h2>Tesserae</h2>

          <button onClick={() => setShowAddFileModal(true)}>+</button>
        </div>

        <div className="file-tree">
          {loading && (
            <div className="classic-file-row">
              <span className="classic-file-name">Loading...</span>
            </div>
          )}

          {!loading && content.length === 0 && (
            <div className="classic-file-row">
              <span className="classic-file-name">No tesserae yet</span>
            </div>
          )}

          {!loading &&
            content.map((file) => (
              <button
                className="classic-file-row"
                key={file.ContentID}
                onClick={() => setSelectedTessera(file)}
              >
                <span className="classic-file-name">{file.Title}</span>
              </button>
            ))}
        </div>
      </aside>

      {showAddFileModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal collection-create-modal">
            <h3>Add tessera</h3>

            <label>Choose file</label>
            <input
              type="file"
              accept={acceptedFileTypes}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedFile(file);
                setFileTitle(file?.name ?? "");
                setFormWarning("");
              }}
            />

            <label>Display name</label>
            <input
              value={fileTitle}
              onChange={(e) => {
                setFileTitle(e.target.value);
                setFormWarning("");
              }}
            />

            <label>Description</label>
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
            />

            <label>Tags</label>
            <div className="property-picker" ref={tagsPickerRef}>
              <div
                className="property-box property-picker-input"
                onClick={() => setEditingTags(true)}
              >
                {selectedTags.map((tag) => (
                  <span className="tessera-tag-chip" key={tag.TagID}>
                    {tag.TagName}

                    {editingTags && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag.TagID);
                        }}
                      >
                        x
                      </button>
                    )}
                  </span>
                ))}

                {editingTags ? (
                  <input
                    autoFocus
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="+ Add tag"
                  />
                ) : (
                  selectedTags.length === 0 && (
                    <span className="tessera-muted">No tags</span>
                  )
                )}
              </div>

              {editingTags && (
                <div className="property-picker-menu">
                  <p>Select an option or create one</p>

                  {availableTags.map((tag) => (
                    <button key={tag.TagID} onClick={() => addTag(tag)}>
                      <span
                        className="tag-dot"
                        style={{ backgroundColor: tag.HexColor }}
                      />
                      {tag.TagName}
                    </button>
                  ))}

                  {tagSearch.trim() !== "" && !tagAlreadyExists && (
                    <button onClick={createTag}>
                      Create <span>{tagSearch.trim()}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {formWarning && <p className="form-warning">{formWarning}</p>}

            <div className="modal-actions">
              <button onClick={resetAddFileModal}>Cancel</button>
              <button onClick={addFile} disabled={submitting}>
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTessera && (
        <TesseraDetail
          tessera={selectedTessera}
          onClose={() => setSelectedTessera(null)}
          onRemoveFromCollection={() => {}}
        />
      )}
    </>
  );
}

export default FilePanel;