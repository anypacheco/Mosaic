import { useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  createCollection as apiCreateCollection,
  deleteCollection as apiDeleteCollection,
  getCollectionContent,
  type Collection,
  type Content,
} from "../api/client";
import TesseraDetail from "./TesseraDetail";

function LeftSidebar() {
  const { collections, currentWorkspace, refreshWorkspaceData } =
    useWorkspace();

  const [openCollectionId, setOpenCollectionId] = useState<number | null>(null);

  //this is the content for the currently expanded collection, loaded from the API

  const [openCollectionContent, setOpenCollectionContent] = useState<Content[]>([]);
  const [loadingContent, setLoadingContent] =useState(false);

  const [selectedTessera, setSelectedTessera]=useState<Content | null>(null);

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const [showCreateModal, setShowCreateModal]= useState(false);
  const [newCollectionName, setNewCollectionName]= useState("");
  const [newCollectionDescription, setNewCollectionDescription] =useState("");
  const [modalError, setModalError] =useState("");

  //load a collection's content whenever it gets expanded
  useEffect(() => {
    if (openCollectionId === null) {
      setOpenCollectionContent([]);
      return;
    }

    setLoadingContent(true);
    getCollectionContent(openCollectionId)
      .then((data) => setOpenCollectionContent(data))
      .catch((err) => {
        console.error("Failed to load collection content:", err);
        setOpenCollectionContent([]);
      })
      .finally(() => setLoadingContent(false));
  }, [openCollectionId]);

  const createCollection = async () => {
    if (newCollectionName.trim() === "" || !currentWorkspace) return;

    setModalError("");

    try {
      const newCollection = await apiCreateCollection({
        WorkspaceID: currentWorkspace.WorkspaceID,
        CollectionName: newCollectionName.trim(),
        Description: newCollectionDescription.trim(),
      });

      await refreshWorkspaceData();
      setOpenCollectionId(newCollection.CollectionID);
      setNewCollectionName("");

      setNewCollectionDescription("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create collection:", err);
      setModalError("Failed to create collection. Please try again.");
    }
  };

  const deleteCollection = async (collectionId: number) => {
    const collection = collections.find(
      (item) => item.CollectionID === collectionId
    );

    if (!collection) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${collection.CollectionName}"?`
    );

    if (!confirmed) return;

    try {
      await apiDeleteCollection(collectionId);
      await refreshWorkspaceData();

      setOpenCollectionId(null);
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  return (
    <>
      <aside className="left-sidebar">
        <div className="file-header">
          <h2>Collections</h2>
          <button onClick={() => setShowCreateModal(true)}>+</button>
        </div>

        <div className="file-tree">
          {collections.map((collection) => {
            const isOpen = openCollectionId === collection.CollectionID;

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
                    {loadingContent ? (
                      <p className="empty-collection">Loading...</p>
                    ) : openCollectionContent.length > 0 ? (
                      openCollectionContent.map((item) => (
                        <button
                          className="collection-content-row"
                          key={item.ContentID}
                          onClick={() => {
                            setSelectedTessera(item);
                            setSelectedCollection(collection);
                          }}
                        >
                          <span className="classic-file-name">
                            {item.Title}
                          </span>
                        </button>
                      ))
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

            {modalError && <p className="form-warning">{modalError}</p>}

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName("");
                  setNewCollectionDescription("");
                  setModalError("");
                }}
              >
                Cancel
              </button>

              <button onClick={createCollection}>Create</button>
            </div>
          </div>
        </div>
      )}

      {selectedTessera && selectedCollection && (
        <TesseraDetail
          tessera={selectedTessera}
          collection={selectedCollection}
          onClose={() => {
            setSelectedTessera(null);
            setSelectedCollection(null);
          }}
          onRemoveFromCollection={async () => {
            if (openCollectionId !== null) {
              try {
                const data = await getCollectionContent(openCollectionId);
                setOpenCollectionContent(data);
              } catch (err) {
                console.error(err);
              }
            }
            setSelectedTessera(null);
            setSelectedCollection(null);
          }}
        />
      )}
    </>
  );
}

export default LeftSidebar;