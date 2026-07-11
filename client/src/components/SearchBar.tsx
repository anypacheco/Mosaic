import { useEffect, useRef, useState } from "react";
import type React from "react";
import { FaRegStar } from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  createSavedSearch as apiCreateSavedSearch,
  deleteSavedSearch as apiDeleteSavedSearch,
  addTagToSavedSearch as apiAddTagToSavedSearch,
  getSavedSearchTags,
  type Tag,
  type ContentType,
  type Collection,
  type Content,
} from "../api/client";
import SaveSearchModal from "./SaveSearch";

function SearchBar() {
  const {
    tags,
    content,
    collections,
    savedSearches,
    currentWorkspace,
    refreshWorkspaceData,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText]=useState("");
  const [selectedTags, setSelectedTags]=useState<Tag[]>([]);
  const [selectedCollections, setSelectedCollections]=useState<Collection[]>([]);

  const [selectedContent, setSelectedContent]=useState<Content[]>([]);
  const [showSaveModal, setShowSaveModal]=useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
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
      tag.TagName.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingContent = content.filter(
    (item) =>
      !selectedContent.some((selected) => selected.ContentID === item.ContentID) &&
      item.Title.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingCollections = collections.filter(
    (collection) =>
      !selectedCollections.some(
        (selected) => selected.CollectionID === collection.CollectionID
      ) &&
      collection.CollectionName.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingSavedSearches = savedSearches.filter((search) =>
    search.SearchName.toLowerCase().includes(searchText.toLowerCase())
  );

  const addTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchText("");
    setOpen(true);
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
  };

  const addCollection = (collection: Collection) => {
    setSelectedCollections([...selectedCollections, collection]);
    setSearchText("");
    setOpen(true);
  };

  const removeCollection = (collectionId: number) => {
    setSelectedCollections(
      selectedCollections.filter(
        (collection) => collection.CollectionID !== collectionId
      )
    );
  };

  const addContent = (item: Content) => {
    setSelectedContent([...selectedContent, item]);
    setSearchText("");
    setOpen(true);
  };

  const removeContent = (contentId: number) => {
    setSelectedContent(
      selectedContent.filter((item) => item.ContentID !== contentId)
    );
  };

  const saveSearch = async (name: string, contentType: ContentType) => {
    if (!currentWorkspace) return;

    try {
      const newSavedSearch = await apiCreateSavedSearch({
        WorkspaceID: currentWorkspace.WorkspaceID,
        SearchName: name,
        ContentType: contentType,
      });

      await Promise.all(
        selectedTags.map((tag) =>
          apiAddTagToSavedSearch(newSavedSearch.SavedSearchID, tag.TagID)
        )
      );

      await refreshWorkspaceData();
      setShowSaveModal(false);
      setOpen(true);
    } catch (err) {
      console.error("Failed to save search:", err);
    }
  };

  const loadSavedSearch = async (savedSearchId: number) => {
    const savedSearch = savedSearches.find(
      (search) => search.SavedSearchID === savedSearchId
    );

    if (!savedSearch) return;

    try {
      const linkedTags = await getSavedSearchTags(savedSearchId);
      setSelectedTags(linkedTags);
      setSearchText(savedSearch.SearchName);
      setOpen(false);
    } catch (err) {
      console.error("Failed to load saved search:", err);
    }
  };

  const deleteSavedSearch = async (
    e: React.MouseEvent<HTMLButtonElement>,
    savedSearchId: number
  ) => {
    e.stopPropagation();

    try {
      await apiDeleteSavedSearch(savedSearchId);
      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to delete saved search:", err);
    }
  };

  const handleSearchSubmit = () => {
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className={open ? "search-main search-open" : "search-main"}>
        <span className="search-icon">⌕</span>

        <div className="search-input-area">
          {selectedTags.map((tag) => (
            <span className="search-chip" key={`tag-${tag.TagID}`}>
              {tag.TagName}
              <button onClick={() => removeTag(tag.TagID)}>x</button>
            </span>
          ))}

          {selectedCollections.map((collection) => (
            <span
              className="search-chip"
              key={`collection-${collection.CollectionID}`}
            >
              {collection.CollectionName}
              <button onClick={() => removeCollection(collection.CollectionID)}>
                x
              </button>
            </span>
          ))}

          {selectedContent.map((item) => (
            <span className="search-chip" key={`content-${item.ContentID}`}>
              {item.Title}
              <button onClick={() => removeContent(item.ContentID)}>x</button>
            </span>
          ))}

          <input
            value={searchText}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setSearchText(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTags.length === 0 &&
              selectedCollections.length === 0 &&
              selectedContent.length === 0
                ? "Search files, tags, collections, or content..."
                : "Search..."
            }
          />
        </div>

        <button
          className="save-search-icon"
          title="Save Search"
          onClick={() => {
            setOpen(false);
            setShowSaveModal(true);
          }}
        >
          <FaRegStar />
        </button>
      </div>

      {open && (
        <div className="filter-dropdown search-picker">
          <p>Select a tag, collection, or tessera</p>

          {matchingSavedSearches.length > 0 && (
            <>
              <h4>Saved Searches</h4>

              {matchingSavedSearches.map((search) => (
                <button
                  className="picker-row saved-search-row"
                  key={search.SavedSearchID}
                  onClick={() => loadSavedSearch(search.SavedSearchID)}
                >
                  <span>{search.SearchName}</span>

                  <button
                    className="delete-saved-search"
                    title="Delete Saved Search"
                    onClick={(e) => deleteSavedSearch(e, search.SavedSearchID)}
                  >
                    x
                  </button>
                </button>
              ))}
            </>
          )}

          {availableTags.length > 0 && (
            <>
              <h4>Tags</h4>

              {availableTags.map((tag) => (
                <button
                  className="picker-row"
                  key={tag.TagID}
                  onClick={() => addTag(tag)}
                >
                  <span
                    className="tag-dot"
                    style={{ backgroundColor: tag.HexColor }}
                  />
                  <span>{tag.TagName}</span>
                </button>
              ))}
            </>
          )}

          {matchingCollections.length > 0 && (
            <>
              <h4>Collections</h4>

              {matchingCollections.map((collection) => (
                <button
                  className="picker-row"
                  key={collection.CollectionID}
                  onClick={() => addCollection(collection)}
                >
                  {collection.CollectionName}
                </button>
              ))}
            </>
          )}

          {matchingContent.length > 0 && (
            <>
              <h4>Tesserae</h4>

              {matchingContent.map((item) => (
                <button
                  className="picker-row"
                  key={item.ContentID}
                  onClick={() => addContent(item)}
                >
                  {item.Title}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {showSaveModal && (
        <SaveSearchModal
          selectedTags={selectedTags}
          onCancel={() => setShowSaveModal(false)}
          onSave={saveSearch}
        />
      )}
    </div>
  );
}

export default SearchBar;