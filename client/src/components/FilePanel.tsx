import { useEffect, useRef, useState } from "react";
import {
  content,
  contentTags,
  tags,
  type ContentType,
} from "../data/mockData";
import TesseraDetail from "./TesseraDetail";

const MAX_FILE_SIZE_MB = 500;
const acceptedFileTypes = ".md,.pdf,.png,.jpg,.jpeg,.mp3,.mp4";

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
  const tagsPickerRef = useRef<HTMLDivElement>(null);

  const [localContent, setLocalContent] = useState(content);
  const [localTags, setLocalTags] = useState(tags);
  const [localContentTags, setLocalContentTags] = useState(contentTags);

  const [selectedTessera, setSelectedTessera] = useState<
    (typeof content)[number] | null
  >(null);

  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");

  const [editingTags, setEditingTags] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<typeof tags>([]);
  const [formWarning, setFormWarning] = useState("");

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
  };

  const availableTags = localTags.filter(
    (tag) =>
      !selectedTags.some((selectedTag) => selectedTag.TagID === tag.TagID) &&
      tag.TagName.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const tagAlreadyExists = localTags.some(
    (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
  );

  const addTag = (tag: (typeof tags)[number]) => {
    setSelectedTags([...selectedTags, tag]);
    setTagSearch("");
    setFormWarning("");
  };

  const createTag = () => {
    if (tagSearch.trim() === "") return;

    const existingTag = localTags.find(
      (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
    );

    if (existingTag) {
      addTag(existingTag);
      return;
    }

    const newTag = {
      TagID: Date.now(),
      WorkspaceID: 1,
      TagName: tagSearch.trim(),
      HexColor: "#9B5DE5",
    };

    setLocalTags([...localTags, newTag]);
    setSelectedTags([...selectedTags, newTag]);
    setTagSearch("");
    setFormWarning("");
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

  const addFile = async () => {
    const missingFieldsMessage = getMissingFieldsMessage();

    if (missingFieldsMessage) {
      setFormWarning(missingFieldsMessage);
      return;
    }

    if (!selectedFile) return;

    const contentType = getContentType(selectedFile.name);

    if (!contentType) return;

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

    const today = new Date().toISOString().split("T")[0];

    const newTessera = {
      ContentID: Date.now(),
      WorkspaceID: 1,
      Title: fileTitle.trim(),
      FilePath: `/files/${selectedFile.name}`,
      TextContent: textContent,
      Description: fileDescription.trim(),
      ContentType: contentType,
      CreatedAt: today,
      ModifiedAt: today,
    };

    const newContentTagLinks = selectedTags.map((tag) => ({
      ContentID: newTessera.ContentID,
      TagID: tag.TagID,
    }));

    setLocalContent([...localContent, newTessera]);
    setLocalContentTags([...localContentTags, ...newContentTagLinks]);
    resetAddFileModal();
  };

  return (
    <>
      <aside className="file-panel">
        <div className="file-header">
          <h2>Tesserae</h2>

          <button onClick={() => setShowAddFileModal(true)}>+</button>
        </div>

        <div className="file-tree">
          {localContent.map((file) => (
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
              <button onClick={addFile}>Add</button>
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