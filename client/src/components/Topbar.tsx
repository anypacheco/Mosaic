import { useState } from "react";
import { workspaces, snapshots } from "../data/mockData";

type TopbarProps = {
  filesOpen: boolean;
  onToggleFiles: () => void;
};

function Topbar({ filesOpen, onToggleFiles }: TopbarProps) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  const latestSnapshot = snapshots
    .filter((snapshot) => snapshot.WorkspaceID === currentWorkspace.WorkspaceID)
    .at(-1);

  return (
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
            {workspaces.map((workspace) => (
              <button
                key={workspace.WorkspaceID}
                onClick={() => {
                  setCurrentWorkspace(workspace);
                  setWorkspaceOpen(false);
                }}
              >
                {workspace.WorkspaceName}
              </button>
            ))}

            <div className="dropdown-divider" />

            <button className="create-workspace">
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
                <p>{latestSnapshot ? latestSnapshot.SnapshotTime : "No snapshots yet"}</p>
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
  );
}

export default Topbar;