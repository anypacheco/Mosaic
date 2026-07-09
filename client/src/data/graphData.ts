import {
  content,
  tags,
  contentTags
} from "./mockData";
// Node types used by the graph
export type GraphNodeType =
  | "content"
  | "tag";
// A node displayed in Cytoscape
export interface GraphNode {
  // unique identifier
  id: string;
  // what kind of node it is
  type: GraphNodeType;
  // text shown on screen
  label: string;
  // used for tag colors
  color?: string;
}
// Connection between two nodes
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}
// Full graph object
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
export function createGraphData(
  workspaceId: number
): GraphData {

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const workspaceContent = content.filter(
    item =>
      item.WorkspaceID === workspaceId
  );

  workspaceContent.forEach(item => {
    nodes.push({
      id: `content-${item.ContentID}`,
      type: "content",
      label: item.Title
    });
  });

  const workspaceTags = tags.filter(
    tag =>
      tag.WorkspaceID === workspaceId
  );

  workspaceTags.forEach(tag => {
    nodes.push({
      id: `tag-${tag.TagID}`,
      type: "tag",
      label: tag.TagName,
      color: tag.HexColor
    });
  });

  const workspaceContentIds =
    workspaceContent.map(
      item => item.ContentID
    );
  contentTags.forEach(connection => {
    // only include this workspace's content
    if (
      workspaceContentIds.includes(
        connection.ContentID
      )
    ) {
      edges.push({
        id:
          `edge-${connection.ContentID}-${connection.TagID}`,
        source:
          `content-${connection.ContentID}`,
        target:
          `tag-${connection.TagID}`
      });
    }
  });
  return {
    nodes,
    edges
  };
}