import { useEffect, useRef, useState } from "react";
import type React from "react";
import { FaRegStar } from "react-icons/fa";
import {
  tags,
  content,
  collections,
  savedSearches as mockSavedSearches,
  savedSearchTags,
  type ContentType,
} from "../data/mockData";
import SaveSearchModal from "./SaveSearch";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<typeof tags>([]);
  const [savedSearches, setSavedSearches] = useState(mockSavedSearches);
  const [localSavedSearchTags, setLocalSavedSearchTags] =
    useState(savedSearchTags);
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  const matchingContent = content.filter((item) =>
    item.Title.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingCollections = collections.filter((collection) =>
    collection.CollectionName.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingSavedSearches = savedSearches.filter((search) =>
    search.SearchName.toLowerCase().includes(searchText.toLowerCase())
  );

  const addTag = (tag: (typeof tags)[number]) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchText("");
    setOpen(true);
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
  };

  const saveSearch = (name: string, contentType: ContentType) => {
    const newSavedSearch = {
      SavedSearchID: Date.now(),
      WorkspaceID: 1,
      SearchName: name,
      ContentType: contentType,
      CreatedAt: new Date().toISOString(),
    };

    const newLinks = selectedTags.map((tag) => ({
      SavedSearchID: newSavedSearch.SavedSearchID,
      TagID: tag.TagID,
    }));

    setSavedSearches([...savedSearches, newSavedSearch]);
    setLocalSavedSearchTags([...localSavedSearchTags, ...newLinks]);
    setShowSaveModal(false);
    setOpen(true);
  };

  const loadSavedSearch = (savedSearchId: number) => {
    const savedSearch = savedSearches.find(
      (search) => search.SavedSearchID === savedSearchId
    );

    if (!savedSearch) return;

    const linkedTagIds = localSavedSearchTags
      .filter((link) => link.SavedSearchID === savedSearchId)
      .map((link) => link.TagID);

    const linkedTags = tags.filter((tag) => linkedTagIds.includes(tag.TagID));

    setSelectedTags(linkedTags);
    setSearchText(savedSearch.SearchName);
    setOpen(false);
  };

  const deleteSavedSearch = (
    e: React.MouseEvent<HTMLButtonElement>,
    savedSearchId: number
  ) => {
    e.stopPropagation();

    setSavedSearches(
      savedSearches.filter((search) => search.SavedSearchID !== savedSearchId)
    );

    setLocalSavedSearchTags(
      localSavedSearchTags.filter(
        (link) => link.SavedSearchID !== savedSearchId
      )
    );
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
        <span className="search-icon">&#8981;</span>

        <div className="search-input-area">
          {selectedTags.map((tag) => (
            <span className="search-chip" key={tag.TagID}>
              {tag.TagName}
              <button onClick={() => removeTag(tag.TagID)}>x</button>
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
              selectedTags.length === 0
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
                <button className="picker-row" key={collection.CollectionID}>
                  {collection.CollectionName}
                </button>
              ))}
            </>
          )}

          {matchingContent.length > 0 && (
            <>
              <h4>Tesserae</h4>

              {matchingContent.map((item) => (
                <button className="picker-row" key={item.ContentID}>
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