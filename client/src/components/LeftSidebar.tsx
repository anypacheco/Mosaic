import { collections } from "../data/mockData";

function LeftSidebar() {
  return (
    <aside className="left-sidebar">
      <div className="file-header">
        <h2>Collections</h2>
        <button>+</button>
      </div>

      <div className="file-tree">
        {collections.map((collection) => (
          <button
            className="folder-row"
            key={collection.CollectionID}
          >
            <span className="chevron">▸</span>
            <span>{collection.CollectionName}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default LeftSidebar;