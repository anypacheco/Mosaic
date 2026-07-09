import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

function getExtension(title: string) {
  const parts = title.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function FilePanel() 
{
  const { content, currentWorkspace, loading }=useWorkspace();
  const [open, setOpen]=useState(true);

  return (
    <aside className="file-panel">
      <div className="file-header">
        <h2>Tesserae </h2>
        <button>+</button>
      </div>

      <div className="file-tree">
        <button className="folder-row" onClick={() => setOpen(!open)}>
          <span className="chevron">{open ? "▾" : "▸"}</span>
          <span>
            {currentWorkspace ? currentWorkspace.WorkspaceName : "Workspace"}
          </span>
        </button>

        {open && loading && 
		(
          <div className="classic-file-row">
            <span className="file-indent"></span>
            <span className="classic-file-name">Loading...</span>
          </div>
        )}

        {open && !loading && content.length === 0 && 
		(
          <div className="classic-file-row">
            <span className="file-indent"></span>
            <span className="classic-file-name">No tesserae yet</span>
          </div>
        )}

        {open &&
          !loading &&
          content.map((file) => 
			(
            <div className="classic-file-row" key={file.ContentID}>
              <span className="file-indent"></span>
              <span className="classic-file-name">{file.Title}</span>
              <span className="file-ext">{getExtension(file.Title)}</span>
            </div>
          ))}
      </div>
    </aside>
  );
}



export default FilePanel;