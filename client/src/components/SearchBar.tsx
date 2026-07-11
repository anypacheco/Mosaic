import { useEffect, useRef, useState } from "react";
import type React from "react";
import { FaRegStar } from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";

import {
  createSavedSearch as apiCreateSavedSearch,
  deleteSavedSearch as apiDeleteSavedSearch,
  addTagToSavedSearch as apiAddTagToSavedSearch,
  getSavedSearchTags,
  getContent,
  type Tag,
  type Content,
  type ContentType,
  type SavedSearch,
} from "../api/client";

import SaveSearchModal from "./SaveSearch";
import TesseraDetail from "./TesseraDetail";

function SearchBar() {
  const {
    tags,
    content,
    savedSearches,
    currentWorkspace,
    refreshWorkspaceData,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedSavedSearch, setSelectedSavedSearch] =
    useState<SavedSearch | null>(null);
  const [selectedTessera, setSelectedTessera] = useState<Content | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [contentTagMap, setContentTagMap] = useState<Record<number, Tag[]>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadContentTags() {
      try {
        const contentWithTags = await Promise.all(
          content.map((item) => getContent(item.ContentID))
        );

        const nextTagMap: Record<number, Tag[]> = {};

        contentWithTags.forEach((item) => {
          nextTagMap[item.ContentID] = item.tags || [];
        });

        setContentTagMap(nextTagMap);
      } catch (err) {
        console.error("Failed to load content tags:", err);
      }
    }

    if (content.length > 0) {
      loadContentTags();
    } else {
      setContentTagMap({});
    }
  }, [content]);

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

  const hasActiveFilter = selectedTags.length > 0 || selectedSavedSearch !== null;

  const availableTags = tags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.TagID === tag.TagID) &&
      tag.TagName.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingSavedSearches = savedSearches.filter((search) =>
    search.SearchName.toLowerCase().includes(searchText.toLowerCase())
  );

  const matchingTesserae = hasActiveFilter
    ? content.filter((item) => {
        const searchValue = searchText.trim().toLowerCase();

        const textMatches =
          searchValue === "" ||
          item.Title.toLowerCase().includes(searchValue) ||
          item.Description?.toLowerCase().includes(searchValue) ||
          item.TextContent?.toLowerCase().includes(searchValue);

        const itemTags = contentTagMap[item.ContentID] || [];

        const tagMatches =
          selectedTags.length === 0 ||
          selectedTags.every((selectedTag) =>
            itemTags.some((tag) => tag.TagID === selectedTag.TagID)
          );

        return textMatches && tagMatches;
      })
    : [];

  const addTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchText("");
    setOpen(true);
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));

    if (selectedSavedSearch) {
      setSelectedSavedSearch(null);
    }
  };

  const clearSavedSearch = () => {
    setSelectedSavedSearch(null);
    setSelectedTags([]);
    setSearchText("");
    setOpen(true);
  };

  const saveSearch = async (name: string, contentType: ContentType | "") => {
    if (!currentWorkspace) return;

    try {
      const newSavedSearch = await apiCreateSavedSearch({
        WorkspaceID: currentWorkspace.WorkspaceID,
        SearchName: name,
        ContentType: contentType || undefined,
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
      setSelectedSavedSearch(savedSearch);
      setSelectedTags(linkedTags);
      setSearchText("");
      setOpen(true);
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

      if (selectedSavedSearch?.SavedSearchID === savedSearchId) {
        setSelectedSavedSearch(null);
        setSelectedTags([]);
      }

      await refreshWorkspaceData();
    } catch (err) {
      console.error("Failed to delete saved search:", err);
    }
  };

  const openTessera = (item: Content) => {
    setSelectedTessera(item);
    setOpen(false);
  };

  const closeTessera = async () => {
    await refreshWorkspaceData();
    setSelectedTessera(null);
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
    <>
      <div className="search-wrapper" ref={wrapperRef}>
        <div className={open ? "search-main search-open" : "search-main"}>
          <span className="search-icon">⌕</span>

          <div className="search-input-area">
            {selectedSavedSearch && (
              <span className="search-chip">
                {selectedSavedSearch.SearchName}
                <button onClick={clearSavedSearch}>x</button>
              </span>
            )}

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
                hasActiveFilter
                  ? "Search matching tesserae..."
                  : "Search tags or saved searches..."
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
            <p>
              {hasActiveFilter
                ? "Open a matching tessera or refine with tags"
                : "Choose a tag or saved search to see matching tesserae"}
            </p>

            {hasActiveFilter && matchingTesserae.length > 0 && (
              <div className="search-section">
                <h4>Results</h4>

                <div className="search-results-list">
                  {matchingTesserae.map((item) => (
                    <button
                      className="picker-row search-result-row"
                      key={item.ContentID}
                      onClick={() => openTessera(item)}
                    >
                      <span>{item.Title}</span>
                      <span className="search-result-type">
                        {item.ContentType}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchingSavedSearches.length > 0 && (
              <div className="search-section">
                <h4>Saved Searches</h4>

                <div className="search-options-list">
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
                        onClick={(e) =>
                          deleteSavedSearch(e, search.SavedSearchID)
                        }
                      >
                        x
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableTags.length > 0 && (
              <div className="search-section">
                <h4>Tags</h4>

                <div className="search-options-list">
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
                </div>
              </div>
            )}

            {hasActiveFilter &&
              matchingTesserae.length === 0 &&
              matchingSavedSearches.length === 0 &&
              availableTags.length === 0 && <p>No matches found</p>}
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

      {selectedTessera && (
        <TesseraDetail
          tessera={selectedTessera}
          onClose={closeTessera}
          onRemoveFromCollection={closeTessera}
        />
      )}
    </>
  );
}

export default SearchBar;