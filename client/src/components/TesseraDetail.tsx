import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  createTag as apiCreateTag,
  type Collection,
  type Content,
  type Tag,
} from "../api/client";

const API_BASE = "http://localhost:3000";

type TesseraDetailProps = {
  tessera: Content;
  collection?: Collection;
  onClose: () => void;
  onRemoveFromCollection: () => void;
};

async function apiRequest(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function TesseraDetail({
  tessera,
  collection,
  onClose,
  onRemoveFromCollection,
}: TesseraDetailProps) {
  const { tags, collections, refreshWorkspaceData } = useWorkspace();

  const [description, setDescription] = useState(tessera.Description || "");
  const [markdownContent, setMarkdownContent] = useState(
    tessera.TextContent || ""
  );
  const [contentWarning, setContentWarning] = useState("");
  const [propertyWarning, setPropertyWarning] = useState("");

  const [editingTags, setEditingTags] = useState(false);
  const [editingCollections, setEditingCollections] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");

  const tagsPickerRef = useRef<HTMLDivElement>(null);
  const collectionsPickerRef = useRef<HTMLDivElement>(null);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>(
    collection ? [collection] : []
  );

  const fileUrl = tessera.FilePath
    ? tessera.FilePath.startsWith("http")
      ? tessera.FilePath
      : `${API_BASE}${tessera.FilePath}`
    : "";

  useEffect(() => {
    async function loadTesseraRelationships() {
      try {
        const tesseraWithTags = await apiRequest(
          `/api/content/${tessera.ContentID}`
        );

        setSelectedTags(tesseraWithTags.tags || []);

        try {
          const loadedCollections = await apiRequest(
            `/api/content/${tessera.ContentID}/collections`
          );

          setSelectedCollections(loadedCollections);
        } catch {
          setSelectedCollections(collection ? [collection] : []);
        }
      } catch (err) {
        console.error("Failed to load tessera relationships:", err);
      }
    }

    loadTesseraRelationships();
  }, [tessera.ContentID, collection]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (tagsPickerRef.current && !tagsPickerRef.current.contains(target)) {
        setEditingTags(false);
        setTagSearch("");
      }

      if (
        collectionsPickerRef.current &&
        !collectionsPickerRef.current.contains(target)
      ) {
        setEditingCollections(false);
        setCollectionSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const availableTags = tags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.TagID === tag.TagID) &&
      tag.TagName.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const availableCollections = collections.filter(
    (item) =>
      !selectedCollections.some(
        (selected) => selected.CollectionID === item.CollectionID
      ) &&
      item.CollectionName.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const tagAlreadyExists = tags.some(
    (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
  );

  const deleteTessera = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${tessera.Title}"?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/content/${tessera.ContentID}`, {
        method: "DELETE",
      });

      await refreshWorkspaceData();
      onClose();
    } catch (err) {
      console.error("Failed to delete tessera:", err);
      setPropertyWarning("Failed to delete tessera. Please try again.");
    }
  };

  const addTag = async (tag: Tag) => {
    try {
      await apiRequest(`/api/content/${tessera.ContentID}/tags/${tag.TagID}`, {
        method: "POST",
      });

      setSelectedTags([...selectedTags, tag]);
      setTagSearch("");
      setPropertyWarning("");
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to add tag:", err);
      setPropertyWarning("Failed to add tag. Please try again.");
    }
  };

  const createTag = async () => {
    if (tagSearch.trim() === "") return;

    const existingTag = tags.find(
      (tag) => tag.TagName.toLowerCase() === tagSearch.trim().toLowerCase()
    );

    if (existingTag) {
      await addTag(existingTag);
      return;
    }

    try {
      const newTag = await apiCreateTag({
        WorkspaceID: tessera.WorkspaceID,
        TagName: tagSearch.trim(),
        HexColor: "#9B5DE5",
      });

      await apiRequest(
        `/api/content/${tessera.ContentID}/tags/${newTag.TagID}`,
        { method: "POST" }
      );

      setSelectedTags([...selectedTags, newTag]);
      setTagSearch("");
      setPropertyWarning("");
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to create tag:", err);
      setPropertyWarning("Failed to create tag. Please try again.");
    }
  };

  const removeTag = async (tagId: number) => {
    if (selectedTags.length <= 1) {
      setPropertyWarning("A tessera must have at least one tag.");
      return;
    }

    try {
      await apiRequest(`/api/content/${tessera.ContentID}/tags/${tagId}`, {
        method: "DELETE",
      });

      setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
      setPropertyWarning("");
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to remove tag:", err);
      setPropertyWarning("Failed to remove tag. Please try again.");
    }
  };

  const addCollection = async (newCollection: Collection) => {
    try {
      await apiRequest(
        `/api/collections/${newCollection.CollectionID}/content/${tessera.ContentID}`,
        { method: "POST" }
      );

      setSelectedCollections([...selectedCollections, newCollection]);
      setCollectionSearch("");
      setPropertyWarning("");
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to add collection:", err);
      setPropertyWarning("Failed to add collection. Please try again.");
    }
  };

  const removeCollection = async (collectionId: number) => {
    try {
      await apiRequest(
        `/api/collections/${collectionId}/content/${tessera.ContentID}`,
        { method: "DELETE" }
      );

      setSelectedCollections(
        selectedCollections.filter((item) => item.CollectionID !== collectionId)
      );

      if (collection?.CollectionID === collectionId) {
        onRemoveFromCollection();
      }

      setPropertyWarning("");
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to remove collection:", err);
      setPropertyWarning("Failed to remove collection. Please try again.");
    }
  };

  const renderContentPreview = () => {
    if (tessera.ContentType === "Markdown") {
      return (
        <>
          <textarea
            className="tessera-text-preview tessera-markdown-editor"
            value={markdownContent}
            onChange={(e) => {
              setMarkdownContent(e.target.value);

              if (e.target.value.trim() === "") {
                setContentWarning("Markdown content cannot be blank.");
              } else {
                setContentWarning("");
              }
            }}
          />

          {contentWarning && <p className="form-warning">{contentWarning}</p>}
        </>
      );
    }

    if (tessera.ContentType === "PDF") {
      if (!fileUrl) {
        return <div className="tessera-text-preview">No PDF file available.</div>;
      }

      return (
        <iframe
          className="tessera-file-preview"
          src={fileUrl}
          title={tessera.Title}
        />
      );
    }

    if (tessera.ContentType === "Image") {
      if (!fileUrl) {
        return (
          <div className="tessera-text-preview">No image file available.</div>
        );
      }

      return (
        <img
          className="tessera-image-preview"
          src={fileUrl}
          alt={tessera.Title}
        />
      );
    }

    if (tessera.ContentType === "Audio") {
      if (!fileUrl) {
        return (
          <div className="tessera-text-preview">No audio file available.</div>
        );
      }

      return (
        <audio controls className="tessera-media-preview">
          <source src={fileUrl} />
        </audio>
      );
    }

    if (tessera.ContentType === "Video") {
      if (!fileUrl) {
        return (
          <div className="tessera-text-preview">No video file available.</div>
        );
      }

      return (
        <video controls className="tessera-video-preview">
          <source src={fileUrl} />
        </video>
      );
    }

    return <p>No preview available.</p>;
  };

  return (
    <div className="modal-backdrop">
      <div className="tessera-detail-modal">
        <div className="tessera-modal-controls">
          <button
            className="delete-tessera-button"
            onClick={deleteTessera}
            title="Delete tessera"
            aria-label="Delete tessera"
          >
            <FaTrash />
          </button>
          <button
            className="close-tessera-button"
            onClick={onClose}
            title="Close"
          >
            x
          </button>
        </div>

        <div className="tessera-page-body">
          <h1>{tessera.Title}</h1>

          <div className="tessera-properties">
            <div className="tessera-property-label">Type</div>
            <div className="read-only-property">{tessera.ContentType}</div>

            <div className="tessera-property-label">Description</div>
            <textarea
              className="property-box description-property"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="tessera-property-label">Tags</div>
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
                      Create <span>{tagSearch}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="tessera-property-label">Collections</div>
            <div className="property-picker" ref={collectionsPickerRef}>
              <div
                className="property-box property-picker-input collection-picker-input"
                onClick={() => setEditingCollections(true)}
              >
                {selectedCollections.map((item) => (
                  <span
                    className="tessera-collection-chip"
                    key={item.CollectionID}
                  >
                    {item.CollectionName}

                    {editingCollections && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCollection(item.CollectionID);
                        }}
                      >
                        x
                      </button>
                    )}
                  </span>
                ))}

                {editingCollections ? (
                  <input
                    autoFocus
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    placeholder="+ Add collection"
                  />
                ) : (
                  selectedCollections.length === 0 && (
                    <span className="tessera-muted">No collections</span>
                  )
                )}
              </div>

              {editingCollections && (
                <div className="property-picker-menu">
                  <p>Select an existing collection</p>

                  {availableCollections.length > 0 ? (
                    availableCollections.map((item) => (
                      <button
                        key={item.CollectionID}
                        onClick={() => addCollection(item)}
                      >
                        {item.CollectionName}
                      </button>
                    ))
                  ) : (
                    <p>No matching collections</p>
                  )}
                </div>
              )}
            </div>

            {propertyWarning && (
              <>
                <div />
                <p className="form-warning">{propertyWarning}</p>
              </>
            )}

            <div className="tessera-property-label">Created</div>
            <div className="read-only-property">{tessera.CreatedAt}</div>

            <div className="tessera-property-label">Modified</div>
            <div className="read-only-property">{tessera.ModifiedAt}</div>
          </div>

          <div className="tessera-content-widget">
            <h3>Content</h3>
            {renderContentPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TesseraDetail;