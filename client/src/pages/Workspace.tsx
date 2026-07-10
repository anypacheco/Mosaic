import SearchBar from "../components/SearchBar";
import GraphView from "../components/GraphView";
import MosaicView from "../components/MosaicView";

type WorkspaceProps = {
  currentView: "graph" | "mosaic";
};

function Workspace({ currentView }: WorkspaceProps) {
  return (
    <main className="workspace" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <SearchBar />

      {/* 
        Setting position relative, flex grow, and height 100% gives the graph 
        a strict bounded boundary so it doesn't collapse into a 0px white space.
      */}
      <section 
        className="graph-container" 
        style={{ 
          flex: 1, 
          position: "relative", 
          width: "100%", 
          height: "100%",
          minHeight: "500px" // Fallback safety minimum bounds
        }}
      >
        {currentView === "graph" ? <GraphView /> : <MosaicView />}

        <button className="add-tessera" style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 10 }}>
          + Add Tessera
        </button>
      </section>
    </main>
  );
}

export default Workspace;