import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import type { Collection, Content } from "../api/client";
import TesseraDetail from "./TesseraDetail";

const API_BASE = "http://localhost:3000";

async function apiRequest(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function LeftSidebar() {
  const { currentWorkspace, collections, refreshWorkspaceData } = useWorkspace();

  const [openCollectionId, setOpenCollectionId] = useState<number | null>(null);
  const [collectionItemsById, setCollectionItemsById] = useState<
    Record<number, Content[]>
  >({});

  const [selectedTessera, setSelectedTessera] = useState<Content | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [formWarning, setFormWarning] = useState("");

  const loadCollectionItems = async (collectionId: number) => {
    try {
      const items = await apiRequest(`/api/collections/${collectionId}/content`);

      setCollectionItemsById((currentItems) => ({
        ...currentItems,
        [collectionId]: items,
      }));
    } catch (err) {
      console.error("Failed to load collection content:", err);
    }
  };

  const toggleCollection = async (collectionId: number) => {
    const isOpen = openCollectionId === collectionId;

    if (isOpen) {
      setOpenCollectionId(null);
      return;
    }

    setOpenCollectionId(collectionId);
    await loadCollectionItems(collectionId);
  };

  const createCollection = async () => {
    if (newCollectionName.trim() === "") {
      setFormWarning("Collection name is required.");
      return;
    }

    if (!currentWorkspace) {
      setFormWarning("Select a workspace before creating a collection.");
      return;
    }

    try {
      const newCollection = await apiRequest("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          WorkspaceID: currentWorkspace.WorkspaceID,
          CollectionName: newCollectionName.trim(),
          Description: newCollectionDescription.trim(),
        }),
      });

      await refreshWorkspaceData();

      setOpenCollectionId(newCollection.CollectionID);
      setCollectionItemsById((currentItems) => ({
        ...currentItems,
        [newCollection.CollectionID]: [],
      }));

      setNewCollectionName("");
      setNewCollectionDescription("");
      setFormWarning("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create collection:", err);
      setFormWarning("Failed to create collection. Please try again.");
    }
  };

  const deleteCollection = async (collection: Collection) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${collection.CollectionName}"?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/collections/${collection.CollectionID}`, {
        method: "DELETE",
      });

      await refreshWorkspaceData();

      setCollectionItemsById((currentItems) => {
        const updatedItems = { ...currentItems };
        delete updatedItems[collection.CollectionID];
        return updatedItems;
      });

      if (openCollectionId === collection.CollectionID) {
        setOpenCollectionId(null);
      }

      if (selectedCollection?.CollectionID === collection.CollectionID) {
        setSelectedTessera(null);
        setSelectedCollection(null);
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (!selectedCollection) return;

    await loadCollectionItems(selectedCollection.CollectionID);
    await refreshWorkspaceData();

    setSelectedTessera(null);
    setSelectedCollection(null);
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
            const collectionItems =
              collectionItemsById[collection.CollectionID] || [];

            return (
              <div className="collection-block" key={collection.CollectionID}>
                <button
                  className={isOpen ? "folder-row active-folder" : "folder-row"}
                  title={collection.Description || "No description"}
                  onClick={() => toggleCollection(collection.CollectionID)}
                >
                  <span className="chevron">{isOpen ? "▾" : "▸"}</span>
                  <span className="collection-name">
                    {collection.CollectionName}
                  </span>
                </button>

                {isOpen && (
                  <div className="collection-details">
                    {collectionItems.length > 0 ? (
                      collectionItems.map((item) => (
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
                      onClick={() => deleteCollection(collection)}
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
              onChange={(e) => {
                setNewCollectionName(e.target.value);
                setFormWarning("");
              }}
            />

            <label>Description</label>
            <textarea
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
            />

            {formWarning && <p className="form-warning">{formWarning}</p>}

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName("");
                  setNewCollectionDescription("");
                  setFormWarning("");
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
          onRemoveFromCollection={handleRemoveFromCollection}
        />
      )}
    </>
  );
}

export default LeftSidebar;