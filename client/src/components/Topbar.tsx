import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { workspaces, snapshots } from "../data/mockData";

type TopbarProps = {
  filesOpen: boolean;
  onToggleFiles: () => void;
};

function Topbar({ filesOpen, onToggleFiles }: TopbarProps) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [localWorkspaces, setLocalWorkspaces] = useState(workspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<
    (typeof workspaces)[number] | null
  >(null);

  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const latestSnapshot = snapshots
    .filter((snapshot) => snapshot.WorkspaceID === currentWorkspace.WorkspaceID)
    .at(-1);

  const createWorkspace = () => {
    if (newWorkspaceName.trim() === "") return;

    const newWorkspace = {
      WorkspaceID: Date.now(),
      WorkspaceName: newWorkspaceName.trim(),
      Description: "",
      CreatedAt: new Date().toISOString(),
    };

    setLocalWorkspaces([...localWorkspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
    setNewWorkspaceName("");
    setShowCreateWorkspaceModal(false);
    setWorkspaceOpen(false);
  };

  const deleteWorkspace = () => {
    if (!workspaceToDelete) return;

    const remainingWorkspaces = localWorkspaces.filter(
      (workspace) => workspace.WorkspaceID !== workspaceToDelete.WorkspaceID
    );

    setLocalWorkspaces(remainingWorkspaces);

    if (currentWorkspace.WorkspaceID === workspaceToDelete.WorkspaceID) {
      setCurrentWorkspace(remainingWorkspaces[0] ?? workspaces[0]);
    }

    setWorkspaceToDelete(null);
    setWorkspaceOpen(false);
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
            <span>{currentWorkspace.WorkspaceName}</span>
            <span className="chevron">{workspaceOpen ? "▾" : "▸"}</span>
          </button>

          {workspaceOpen && (
            <div className="workspace-dropdown">
              {localWorkspaces.map((workspace) => (
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

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCreateWorkspaceModal(false);
                  setNewWorkspaceName("");
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
              Are you sure you want to delete 
              "{workspaceToDelete.WorkspaceName}"? This will remove its
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