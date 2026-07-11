import { useState } from "react";
import { FaTrash, FaCamera, FaHistory } from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";

import {
  createWorkspace as apiCreateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  type Workspace,
} from "../api/client";

type TopbarProps = {
  onToggleFiles: () => void;
};

type SnapshotRow = {
  SnapshotID: number;
  WorkspaceID: number;
  SnapshotName: string;
  SnapshotTime: string;
  ContentSummary: string | null;
  TagSummary: string | null;
  snapshotId?: number;
  snapshotName?: string;
  snapshotTime?: string;
  contentSummary?: string;
  tagSummary?: string;
};

function Topbar({ onToggleFiles }: TopbarProps) {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    refreshWorkspaces,
  } = useWorkspace();

  // --- UI Layout Toggles ---
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); 
  const [showCreateSnapshotForm, setShowCreateSnapshotForm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  // --- Input Element Strings ---
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newSnapshotLabel, setNewSnapshotLabel] = useState("");
  const [modalError, setModalError] = useState("");
  const [localTimelineList, setLocalTimelineList] = useState<SnapshotRow[]>([]);

  const workspaceId = currentWorkspace?.WorkspaceID || 1;

  // --- Snapshot Actions ---
  const handleTakeSnapshot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newSnapshotLabel.trim()) {
      alert("Please provide a valid snapshot label text.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ SnapshotName: newSnapshotLabel.trim() })
      });

      if (!response.ok) throw new Error("Server rejected request parameters.");

      alert("Snapshot saved successfully!");
      
      setNewSnapshotLabel("");
      setShowCreateSnapshotForm(false);
      
      // Update history elements directly
      const responseData = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/snapshots`);
      if (responseData.ok) {
        const freshList = await responseData.json();
        setLocalTimelineList(Array.isArray(freshList) ? freshList : []);
      }
    } catch (err) {
      console.error("Snapshot creation failed:", err);
      alert("Could not process snapshot creation sequence.");
    }
  };

  const handleViewTimeline = async () => {
    setTimelineOpen(false);
    try {
      const response = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/snapshots`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setLocalTimelineList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Timeline fetch failed:", err);
    }
    setShowHistoryModal(true);
  };

  const handleDeleteSnapshot = async (snapshotId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this snapshot point?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/snapshots/${snapshotId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Server rejected deletion request.");

      const updateResponse = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/snapshots`);
      if (updateResponse.ok) {
        const freshData = await updateResponse.json();
        setLocalTimelineList(Array.isArray(freshData) ? freshData : []);
      }
    } catch (err) {
      console.error("Failed to delete snapshot:", err);
      alert("Could not delete snapshot from database.");
    }
  };

  // --- Workspace Actions ---
  const createWorkspace = async () => {
    if (newWorkspaceName.trim() === "") return;
    setModalError("");

    try {
      const newWorkspace = await apiCreateWorkspace({
        WorkspaceName: newWorkspaceName.trim(),
      });

      await refreshWorkspaces();
      setCurrentWorkspace(newWorkspace);
      setNewWorkspaceName("");
      setShowCreateWorkspaceModal(false);
      setWorkspaceOpen(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setModalError("Failed to create workspace. Please try again.");
    }
  };

  const deleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    try {
      await apiDeleteWorkspace(workspaceToDelete.WorkspaceID);
      const updated = await refreshWorkspaces();

      if (currentWorkspace?.WorkspaceID === workspaceToDelete.WorkspaceID) {
        setCurrentWorkspace(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    } finally {
      setWorkspaceToDelete(null);
      setWorkspaceOpen(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="logo">Mosaic</div>

        <div className="workspace-wrapper">
          <button
            className="workspace-select"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
          >
            <span>
              {currentWorkspace ? currentWorkspace.WorkspaceName : "..."}
            </span>
            <span className="chevron">{workspaceOpen ? "▾" : "▸"}</span>
          </button>

          {workspaceOpen && (
            <div className="workspace-dropdown">
              {workspaces.map((workspace) => (
                <div className="workspace-row" key={workspace.WorkspaceID}>
                  <button
                    className="workspace-option"
                    onClick={() => {
                      setCurrentWorkspace(workspace);
                      setWorkspaceOpen(false);
                    }}
                  >
                    {workspace.WorkspaceName}
                  </button>

                  <button
                    className="workspace-delete"
                    title={`Delete ${workspace.WorkspaceName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceToDelete(workspace);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <div className="dropdown-divider" />

              <button
                className="create-workspace"
                onClick={() => {
                  setWorkspaceOpen(false);
                  setShowCreateWorkspaceModal(true);
                }}
              >
                + Create New Workspace
              </button>
            </div>
          )}
        </div>

        <div className="topbar-spacer" />

        <div className="topbar-right">
          <div className="timeline-wrapper">
            <button
              className="timeline-button"
              onClick={() => setTimelineOpen(!timelineOpen)}
            >
              <div className="timeline-header">
                <span>Snapshot</span>
                <span className="chevron">{timelineOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {timelineOpen && (
              <div className="timeline-dropdown">
                <button onClick={handleViewTimeline} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left" }}>
                  <FaHistory size={12} /> View Timeline
                </button>
                <button 
                  onClick={() => {
                    setTimelineOpen(false);
                    setShowCreateSnapshotForm(true);
                  }} 
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left" }}
                >
                  <FaCamera size={12} /> Take Snapshot
                </button>
              </div>
            )}
          </div>

          <button className="menu-button" onClick={onToggleFiles}>
            ☰
          </button>
        </div>
      </header>

      {/* Take Snapshot Modal Panel */}
      {showCreateSnapshotForm && (
        <div className="modal-backdrop">
          <div className="confirm-modal collection-create-modal">
            <h3>Take Workspace Snapshot</h3>
            <p style={{ fontSize: "13px", opacity: 0.7, margin: "-4px 0 12px 0" }}>
              This freezes a structural list configuration copy of all your active workspace items.
            </p>

            <form onSubmit={handleTakeSnapshot}>
              <label htmlFor="snapshotLabelInput">Snapshot Label / Description</label>
              <input
                id="snapshotLabelInput"
                placeholder="e.g., Working Draft, Milestones v2, Review Copy"
                value={newSnapshotLabel}
                onChange={(e) => setNewSnapshotLabel(e.target.value)}
                autoFocus
                required
                style={{ width: "100%", boxSizing: "border-box" }}
              />

              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSnapshotForm(false);
                    setNewSnapshotLabel("");
                  }}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  disabled={!newSnapshotLabel.trim()}
                  style={{ opacity: newSnapshotLabel.trim() ? 1 : 0.6 }}
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Timeline Overview Modal */}
      {showHistoryModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal collection-create-modal" style={{ maxWidth: "480px", width: "100%" }}>
            <h3>Workspace Snapshot Timeline</h3>
            
            <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", margin: "15px 0", paddingRight: "4px" }}>
              {localTimelineList.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "14px", textAlign: "center" }}>No snapshot entries found in your garden timeline history.</p>
              ) : (
                localTimelineList.map((item) => {
                  const snapId = item.snapshotId || item.SnapshotID;
                  const snapName = item.snapshotName || item.SnapshotName;
                  const snapTime = item.snapshotTime || item.SnapshotTime;
                  
                  // Extract node summaries and tag summaries cleanly
                  const contentSummary = item.contentSummary || item.ContentSummary || (item as any).contentsummary || null;
                  const tagSummary = item.tagSummary || item.TagSummary || (item as any).tagsummary || null;

                  return (
                    <div 
                      key={snapId} 
                      style={{ 
                        padding: "12px", 
                        background: "var(--code-bg)", 
                        borderRadius: "6px", 
                        borderLeft: "4px solid var(--accent)", 
                        textAlign: "left",
                        position: "relative",
                        marginBottom: "10px"
                      }}
                    >
                      {/* Delete Action Trigger icon */}
                      <button
                        onClick={() => handleDeleteSnapshot(snapId)}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "none",
                          border: "none",
                          color: "var(--text-muted, #999)",
                          cursor: "pointer",
                          padding: "4px"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted, #999)")}
                        title="Delete Snapshot"
                      >
                        <FaTrash size={12} />
                      </button>

                      <p style={{ margin: "0 24px 4px 0", fontWeight: "600", color: "var(--text-h)", fontSize: "14px", lineBreak: "anywhere" }}>
                        {snapName}
                      </p>

                      {/* Content Preview Summary Section */}
                      <div style={{ margin: "6px 0", padding: "6px 8px", background: "rgba(0,0,0,0.15)", borderRadius: "4px", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", display: "block", color: "var(--accent)", marginBottom: "2px" }}>Captured Tesserae:</span>
                        <p style={{ margin: 0, opacity: 0.8, fontStyle: contentSummary ? "normal" : "italic", fontSize: "11px" }}>
                          {contentSummary ? contentSummary : "No notes found in this snapshot."}
                        </p>
                      </div>

                      {/* Active Tags Summary Section */}
                      <div style={{ margin: "6px 0", padding: "6px 8px", background: "rgba(0,0,0,0.15)", borderRadius: "4px", fontSize: "12px" }}>
                        <span style={{ fontWeight: "600", display: "block", color: "#2ecc71", marginBottom: "2px" }}>Active Tags:</span>
                        <p style={{ margin: 0, opacity: 0.8, fontStyle: tagSummary ? "normal" : "italic", fontSize: "11px" }}>
                          {tagSummary ? tagSummary : "No tags associated with these notes."}
                        </p>
                      </div>

                      <span style={{ fontSize: "11px", opacity: 0.5, display: "block", marginTop: "6px" }}>
                        Captured: {new Date(snapTime).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowHistoryModal(false)}>Close Timeline</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateWorkspaceModal && (
        <div className="modal-backdrop">
          <div className="confirm-modal collection-create-modal">
            <h3>Create workspace</h3>

            <label>Workspace name</label>
            <input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              autoFocus
            />

            {modalError && <p className="form-warning">{modalError}</p>}

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCreateWorkspaceModal(false);
                  setNewWorkspaceName("");
                  setModalError("");
                }}
              >
                Cancel
              </button>

              <button onClick={createWorkspace}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workspace Modal */}
      {workspaceToDelete && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <h3>Delete workspace?</h3>

            <p>
              Are you sure you want to delete "
              {workspaceToDelete.WorkspaceName}"? This will remove its
              tesserae, tags, collections, saved searches, and snapshots.
            </p>

            <div className="modal-actions">
              <button onClick={() => setWorkspaceToDelete(null)}>
                Cancel
              </button>

              <button className="danger-button" onClick={deleteWorkspace}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;