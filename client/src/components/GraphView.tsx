import CytoscapeComponent from "react-cytoscapejs";
import { useRef } from "react";
import {
  createGraphData
} from "../data/graphData";

function GraphView(){
  const workspaceId = 1;
  const cyRef = useRef<any>(null);
  const graph =
    createGraphData(workspaceId);
  const elements = [
    ...graph.nodes.map(node=>({
      data:{
        id:node.id,
        label:node.label,
        type:node.type,
        color:node.color
      }
    })),
    ...graph.edges.map(edge=>({
      data:{
        id:edge.id,
        source:edge.source,
        target:edge.target
      }
    }))
  ];

  return (
    <div className="graph-container">
      <CytoscapeComponent
        cy={(cy)=>{
          cyRef.current = cy;
          setTimeout(()=>{
            cy.fit();
          },200);
        }}
        elements={elements}
        layout={{
          name:"cose",
          animate:false,
          padding:50,
          nodeRepulsion:400000,
          idealEdgeLength:120,
          edgeElasticity:100
        }}
        style={{
          width:"100%",
          height:"100%"
        }}
        stylesheet={[
          {
            selector:"node[type='content']",
            style:{
              label:"data(label)",
              "background-color":"#888",
              color:"white",
              width:35,
              height:35,
              "font-size":10
            }
          },
          {
            selector:"node[type='tag']",
            style:{
              label:"data(label)",
              "background-color":"data(color)",
              color:"white",
              width:60,
              height:60,
              "font-size":14,
              "font-weight":"bold"
            }
          },
          {
            selector:"edge",
            style:{
              width:2,
              "line-color":"#777"
            }
          }
        ]}
      />
    </div>
  );
}

export default GraphView;