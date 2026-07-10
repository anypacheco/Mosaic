import CytoscapeComponent from "react-cytoscapejs";
import { useRef, useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { createGraphData, type GraphData } from "../data/graphData";

// Base route matching your active network backend server setup
const API_BASE = "http://localhost:3000";

/**
 * Shared utility wrapper to securely process fetch operations 
 * and capture response headers.
 */
async function apiRequest(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    throw new Error(`Graph network request failed with status: ${response.status}`);
  }

  return response.json();
}

function GraphView() {
  // Extract active working parameters directly from your existing Workspace Context
  const { currentWorkspace } = useWorkspace();
  
  // Safely grab Workspace ID if currentWorkspace is loaded
  const workspaceId = currentWorkspace?.WorkspaceID || 1; 

  const cyRef = useRef<any>(null);

  // Layout processing operational lifecycle hooks
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatabaseGraph() {
      try {
        setLoading(true);
        setError(null);

        // Direct call utilizing your standard centralized apiRequest utility
        const data = await apiRequest(`/api/workspaces/${workspaceId}/graph`);

        // Convert the structural server lists into formatted nodes and edge segments
        const liveGraphData = createGraphData(
          workspaceId,
          data.content || [],
          data.tags || [],
          data.contentTags || []
        );

        setGraph(liveGraphData);
      } catch (err) {
        console.error("Failed to compile layout visualization data mapping:", err);
        setError("Unable to interface with relational graph database components.");
      } finally {
        setLoading(false);
      }
    }

    fetchDatabaseGraph();
  }, [workspaceId]);

  // Handle loading and error display safeguards
  if (loading) {
    return <div style={{ padding: "20px", color: "#666" }}>Refreshing live workspace visualization...</div>;
  }
  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }
  if (!graph || graph.nodes.length === 0) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        Your Digital Garden is empty! Link a Tessera to a Tag to start visualizing connections.
      </div>
    );
  }

  // Construct Cytoscape-formatted flat list arrays
  const elements = [
    ...graph.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        color: node.color,
      },
    })),
    ...graph.edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
      },
    })),
  ];

  return (
    // Uses 100vh viewport height tracking to guarantee visible rendering block sizing
    <div className="graph-container" style={{ width: "100%", height: "100vh" }}>
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
          setTimeout(() => {
            cy.fit();
          }, 200);
        }}
        elements={elements}
        layout={{
          name: "cose",
          animate: false,
          padding: 50,
          nodeRepulsion: 400000,
          idealEdgeLength: 120,
          edgeElasticity: 100,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        stylesheet={[
          {
            selector: "node[type='content']",
            style: {
              label: "data(label)",
              "background-color": "#888",
              color: "white",
              width: 35,
              height: 35,
              "font-size": 10,
            },
          },
          {
            selector: "node[type='tag']",
            style: {
              label: "data(label)",
              "background-color": "data(color)",
              color: "white",
              width: 60,
              height: 60,
              "font-size": 14,
              "font-weight": "bold",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#777",
            },
          },
        ]}
      />
    </div>
  );
}

export default GraphView;