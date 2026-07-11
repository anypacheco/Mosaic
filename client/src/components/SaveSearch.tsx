import type { ContentType } from "../data/mockData";
import { useState } from "react";

type SaveSearchModalProps = {
  selectedTags: {
    TagID: number;
    TagName: string;
  }[];
  onCancel: () => void;
  onSave: (name: string, contentType: ContentType | "") => void;
};

function SaveSearchModal({
  selectedTags,
  onCancel,
  onSave,
}: SaveSearchModalProps) {
  const [searchName, setSearchName] = useState("");
  const [contentType, setContentType] = useState<ContentType | "">("");

  return (
    <div className="modal-backdrop">
      <div className="save-search-modal">
        <h2>Save Search</h2>

        <label>Search Name</label>
        <input
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <label>Content Type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType | "")}
        >
          <option value="">Any</option>
          <option value="Markdown">Markdown</option>
          <option value="PDF">PDF</option>
          <option value="Image">Image</option>
          <option value="Audio">Audio</option>
          <option value="Video">Video</option>
        </select>

        <label>Tags</label>
        <div className="modal-tag-list">
          {selectedTags.length > 0
            ? selectedTags.map((tag) => (
                <span className="search-chip" key={tag.TagID}>
                  {tag.TagName}
                </span>
              ))
            : "No tags selected"}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>

          <button
            onClick={() => {
              if (searchName.trim() === "") return;
              onSave(searchName.trim(), contentType);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveSearchModal;