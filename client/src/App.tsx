import { useState } from "react";
import "./App.css";

import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import Topbar from "./components/Topbar";
import LeftSidebar from "./components/LeftSidebar";
import SearchBar from "./components/SearchBar";
import DisplayPanel from "./components/DisplayPanel";
import FilePanel from "./components/FilePanel";

//inner component so it can read the context (error banner)

function AppShell() 
{
  const [filesOpen,setFilesOpen]=useState(true);
  const { error }=useWorkspace();

  return (
    <div className={filesOpen ? "app" : "app files-closed"}>
      <Topbar onToggleFiles={() => setFilesOpen(!filesOpen)} />

      {error && (
        <div
          style={{
            background: "#3a1a1a",
            color: "#ffb4b4",
            padding: "8px 16px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <div className="main-layout">
        <LeftSidebar />

        <main className="content-area">
          <SearchBar />
          <DisplayPanel />
        </main>

        <FilePanel />
      </div>
    </div>
  );
}


function App() {
	return (
		<WorkspaceProvider>
			<AppShell />
		</WorkspaceProvider>
	);
}

export default App;