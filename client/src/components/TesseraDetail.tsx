import { useEffect, useRef, useState } from "react";
import { collections, content, contentTags, tags } from "../data/mockData";

type TesseraDetailProps = {
  tessera: (typeof content)[number];
  collection?: (typeof collections)[number];
  onClose: () => void;
  onRemoveFromCollection: () => void;
};

function TesseraDetail({
  tessera,
  collection,
  onClose,
  onRemoveFromCollection,
}: TesseraDetailProps) {
  const [description, setDescription] = useState(tessera.Description || "");
  const [markdownContent, setMarkdownContent] = useState(
    tessera.TextContent || ""
  );
  const [contentWarning, setContentWarning] = useState("");

  const [editingTags, setEditingTags] = useState(false);
  const [editingCollections, setEditingCollections] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");

  const tagsPickerRef = useRef<HTMLDivElement>(null);
  const collectionsPickerRef = useRef<HTMLDivElement>(null);

  const [selectedTags, setSelectedTags] = useState(
    contentTags
      .filter((link) => link.ContentID === tessera.ContentID)
      .map((link) => tags.find((tag) => tag.TagID === link.TagID))
      .filter(Boolean) as typeof tags
  );

  const [selectedCollections, setSelectedCollections] = useState(
    collection ? [collection] : []
  );

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

  const addTag = (tag: (typeof tags)[number]) => {
    setSelectedTags([...selectedTags, tag]);
    setTagSearch("");
  };

  const createTag = () => {
    if (tagSearch.trim() === "") return;

    const newTag = {
      TagID: Date.now(),
      WorkspaceID: tessera.WorkspaceID,
      TagName: tagSearch.trim(),
      HexColor: "#9B5DE5",
    };

    setSelectedTags([...selectedTags, newTag]);
    setTagSearch("");
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
  };

  const addCollection = (newCollection: (typeof collections)[number]) => {
    setSelectedCollections([...selectedCollections, newCollection]);
    setCollectionSearch("");
  };

  const removeCollection = (collectionId: number) => {
    setSelectedCollections(
      selectedCollections.filter((item) => item.CollectionID !== collectionId)
    );

    if (collection?.CollectionID === collectionId) {
      onRemoveFromCollection();
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
      return (
        <iframe
          className="tessera-file-preview"
          src={tessera.FilePath}
          title={tessera.Title}
        />
      );
    }

    if (tessera.ContentType === "Image") {
      return (
        <img
          className="tessera-image-preview"
          src={tessera.FilePath}
          alt={tessera.Title}
        />
      );
    }

    if (tessera.ContentType === "Audio") {
      return (
        <audio controls className="tessera-media-preview">
          <source src={tessera.FilePath} />
        </audio>
      );
    }

    if (tessera.ContentType === "Video") {
      return (
        <video controls className="tessera-video-preview">
          <source src={tessera.FilePath} />
        </video>
      );
    }

    return <p>No preview available.</p>;
  };

  return (
    <div className="modal-backdrop">
      <div className="tessera-detail-modal">
        <div className="tessera-modal-controls">
          <button onClick={onClose} title="Close">
            ×
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
                        ×
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
                        ×
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