import { useState } from "react";
import { collections, collectionContent, content } from "../data/mockData";
import TesseraDetail from "./TesseraDetail";

function LeftSidebar() {
  const [localCollections, setLocalCollections] = useState(collections);
  const [localCollectionContent, setLocalCollectionContent] =
    useState(collectionContent);
  const [openCollectionId, setOpenCollectionId] = useState<number | null>(null);
  const [selectedTessera, setSelectedTessera] = useState<
    (typeof content)[number] | null
  >(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  const createCollection = () => {
    if (newCollectionName.trim() === "") return;

    const newCollection = {
      CollectionID: Date.now(),
      WorkspaceID: 1,
      CollectionName: newCollectionName.trim(),
      Description: newCollectionDescription.trim(),
      CreatedAt: new Date().toISOString(),
    };

    setLocalCollections([...localCollections, newCollection]);
    setOpenCollectionId(newCollection.CollectionID);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setShowCreateModal(false);
  };

  const deleteCollection = (collectionId: number) => {
    const collection = localCollections.find(
      (item) => item.CollectionID === collectionId
    );

    if (!collection) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${collection.CollectionName}"?`
    );

    if (!confirmed) return;

    setLocalCollections(
      localCollections.filter((item) => item.CollectionID !== collectionId)
    );

    setLocalCollectionContent(
      localCollectionContent.filter((link) => link.CollectionID !== collectionId)
    );

    setOpenCollectionId(null);
  };

  const removeContentFromCollection = (
    collectionId: number,
    contentId: number
  ) => {
    setLocalCollectionContent(
      localCollectionContent.filter(
        (link) =>
          !(link.CollectionID === collectionId && link.ContentID === contentId)
      )
    );

    setSelectedTessera(null);
    setSelectedCollectionId(null);
  };

  return (
    <>
      <aside className="left-sidebar">
        <div className="file-header">
          <h2>Collections</h2>
          <button onClick={() => setShowCreateModal(true)}>+</button>
        </div>

        <div className="file-tree">
          {localCollections.map((collection) => {
            const isOpen = openCollectionId === collection.CollectionID;

            const collectionItems = localCollectionContent
              .filter((link) => link.CollectionID === collection.CollectionID)
              .map((link) =>
                content.find((item) => item.ContentID === link.ContentID)
              )
              .filter(Boolean);

            return (
              <div className="collection-block" key={collection.CollectionID}>
                <button
                  className={isOpen ? "folder-row active-folder" : "folder-row"}
                  title={collection.Description || "No description"}
                  onClick={() =>
                    setOpenCollectionId(isOpen ? null : collection.CollectionID)
                  }
                >
                  <span className="chevron">{isOpen ? "▾" : "▸"}</span>
                  <span className="collection-name">
                    {collection.CollectionName}
                  </span>
                </button>

                {isOpen && (
                  <div className="collection-details">
                    {collectionItems.length > 0 ? (
                      collectionItems.map((item) =>
                        item ? (
                          <button
                            className="collection-content-row"
                            key={item.ContentID}
                            onClick={() => {
                              setSelectedTessera(item);
                              setSelectedCollectionId(collection.CollectionID);
                            }}
                          >
                            <span className="classic-file-name">
                              {item.Title}
                            </span>
                          </button>
                        ) : null
                      )
                    ) : (
                      <p className="empty-collection">No tesserae yet</p>
                    )}

                    <button
                      className="delete-collection-button"
                      onClick={() => deleteCollection(collection.CollectionID)}
                    >
                      Delete collection
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal collection-create-modal">
            <h3>Create collection</h3>

            <label>Collection name</label>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />

            <label>Description</label>
            <textarea
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName("");
                  setNewCollectionDescription("");
                }}
              >
                Cancel
              </button>

              <button onClick={createCollection}>Create</button>
            </div>
          </div>
        </div>
      )}

      {selectedTessera && selectedCollectionId && (
        <TesseraDetail
          tessera={selectedTessera}
          collection={localCollections.find(
            (collection) => collection.CollectionID === selectedCollectionId
          )}
          onClose={() => {
            setSelectedTessera(null);
            setSelectedCollectionId(null);
          }}
          onRemoveFromCollection={() =>
            removeContentFromCollection(
              selectedCollectionId,
              selectedTessera.ContentID
            )
          }
        />
      )}
    </>
  );
}

export default LeftSidebar;