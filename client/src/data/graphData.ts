export interface GraphNode {
  id: string;
  type: "content" | "tag";
  label: string;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function createGraphData(
  workspaceId: number,
  contentList: any[],
  tagsList: any[],
  contentTagsList: any[]
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const numericWorkspaceId = Number(workspaceId);

  // 1. Filter and map Content
  const workspaceContent = contentList.filter(
    (item) => Number(item.WorkspaceID) === numericWorkspaceId
  );
  workspaceContent.forEach((item) => {
    nodes.push({
      id: `content-${item.ContentID}`,
      type: "content",
      label: item.Title || "Untitled Tessera",
    });
  });

  // 2. Filter and map Tags
  const workspaceTags = tagsList.filter(
    (tag) => Number(tag.WorkspaceID) === numericWorkspaceId
  );
  workspaceTags.forEach((tag) => {
    nodes.push({
      id: `tag-${tag.TagID}`,
      type: "tag",
      label: tag.TagName,
      color: tag.HexColor || "#9B5DE5",
    });
  });

  // 3. Map Connections
  const workspaceContentIds = workspaceContent.map((item) => item.ContentID);
  contentTagsList.forEach((connection) => {
    if (workspaceContentIds.includes(connection.ContentID)) {
      edges.push({
        id: `edge-${connection.ContentID}-${connection.TagID}`,
        source: `content-${connection.ContentID}`,
        target: `tag-${connection.TagID}`,
      });
    }
  });

  return { nodes, edges };
}