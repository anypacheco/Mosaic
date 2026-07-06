import { useState } from "react";
import "./App.css";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Workspace from "./pages/Workspace";

function App() {
  const [filesOpen, setFilesOpen] = useState(true);

  return (
    <div className="app">
      <Topbar onToggleFiles={() => setFilesOpen(!filesOpen)} />

      <div className="main">
        <Workspace />
        <Sidebar isOpen={filesOpen} />
      </div>
    </div>
  );
}

export default App;