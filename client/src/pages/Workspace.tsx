import SearchBar from "../components/SearchBar";
import GraphView from "../components/GraphView";
import MosaicView from "../components/MosaicView";

type WorkspaceProps = {
  currentView: "graph" | "mosaic";
};

function Workspace({ currentView }: WorkspaceProps) {
  return (
    <main className="workspace">
      <SearchBar />

      <section className="graph-container">
        {currentView === "graph" ? <GraphView /> : <MosaicView />}

        <button className="add-tessera">+ Add Tessera</button>
      </section>
    </main>
  );
}

export default Workspace;