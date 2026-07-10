import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";


import 
{
  createWorkspace as apiCreateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  type Workspace,
} from "../api/client";

type TopbarProps = 
{
  onToggleFiles: () => void;
};

function Topbar({ onToggleFiles }: TopbarProps) {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    snapshots,
    refreshWorkspaces,
  } =useWorkspace();

  const [timelineOpen, setTimelineOpen]=useState(false);
  const [workspaceOpen, setWorkspaceOpen]=useState(false);

  const [workspaceToDelete, setWorkspaceToDelete] =useState<Workspace | null>(null);

  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [modalError, setModalError] = useState("");

  // snapshots in context already belong to the current workspace
  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;

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
    } catch (err) 
	{
      console.error("Failed to delete workspace:", err);
    } finally 
	{
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
                <span>Timeline</span>
                <span className="chevron">{timelineOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {timelineOpen && (
              <div className="timeline-dropdown">
                <div className="timeline-meta">
                  <span>Last Snapshot</span>
                  <p>
                    {latestSnapshot
                      ? latestSnapshot.SnapshotTime
                      : "No snapshots yet"}
                  </p>
                </div>

                <div className="dropdown-divider" />

                <button>View Timeline</button>
                <button>Take Snapshot</button>
              </div>
            )}
          </div>

          <button className="menu-button" onClick={onToggleFiles}>
            ☰
          </button>
        </div>
      </header>

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