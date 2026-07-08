import { useState } from "react";
import "./App.css";

import Topbar from "./components/Topbar";
import LeftSidebar from "./components/LeftSidebar";
import SearchBar from "./components/SearchBar";
import DisplayPanel from "./components/DisplayPanel";
import FilePanel from "./components/FilePanel";

function App() {
  const [filesOpen, setFilesOpen] = useState(true);

  return (
    <div className={filesOpen ? "app" : "app files-closed"}>
      <Topbar filesOpen={filesOpen} onToggleFiles={() => setFilesOpen(!filesOpen)} />

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

export default App;