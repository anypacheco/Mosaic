import { useState } from "react";
import GraphView from "./GraphView";
import MosaicView from "./MosaicView";

function DisplayPanel() {
  const [view, setView] = useState<"graph" | "mosaic">("graph");

  return (
    <section className="display-panel">
      <div className="display-toggle">
        <button
          className={view === "graph" ? "active" : ""}
          onClick={() => setView("graph")}
        >
          Graph View
        </button>

        <button
          className={view === "mosaic" ? "active" : ""}
          onClick={() => setView("mosaic")}
        >
          Mosaic View
        </button>
      </div>

      {view === "graph" ? <GraphView /> : <MosaicView />}
    </section>
  );
}

export default DisplayPanel;