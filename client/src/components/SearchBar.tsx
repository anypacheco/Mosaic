import { useEffect, useRef, useState } from "react";
import { tags, content, collections } from "../data/mockData";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<typeof tags>([]);
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

  const addTag = (tag: (typeof tags)[number]) => {
    setSelectedTags([...selectedTags, tag]);
    setSearchText("");
    setOpen(true);
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((tag) => tag.TagID !== tagId));
  };

  const createTag = () => {
    if (searchText.trim() === "") return;

    const newTag = {
      TagID: Date.now(),
      WorkspaceID: 1,
      TagName: searchText.trim(),
      HexColor: "#9B5DE5",
    };

    setSelectedTags([...selectedTags, newTag]);
    setSearchText("");
    setOpen(true);
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className={open ? "search-main search-open" : "search-main"}>
        <span className="search-icon">⌕</span>

        <div className="search-input-area">
          {selectedTags.map((tag) => (
            <span className="search-chip" key={tag.TagID}>
              {tag.TagName}
              <button onClick={() => removeTag(tag.TagID)}>×</button>
            </span>
          ))}

          <input
            value={searchText}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setSearchText(e.target.value);
              setOpen(true);
            }}
            placeholder={
              selectedTags.length === 0
                ? "Search files, tags, or content..."
                : "Search..."
            }
          />
        </div>

        <button className="save-search-icon" title="Save Search">
          ☆
        </button>
      </div>

      {open && (
        <div className="filter-dropdown search-picker">
          <p>Select a tag, collection, or tessera</p>

          <h4>Saved Searches</h4>
          <div className="saved-search-placeholder">
            Saved searches will be here
          </div>

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

          {searchText.trim() !== "" && (
            <>
              <div className="dropdown-divider" />

              <button className="picker-row create-row" onClick={createTag}>
                Create tag "{searchText}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;