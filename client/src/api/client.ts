// central place for all backend API calls. The backend runs on http://localhost:3000 (see server/src/index.js)

const API_BASE = "http://localhost:3000/api";

//types (match the columns returned by the backend)

export type ContentType = "Markdown" | "PDF" | "Image" | "Audio" | "Video";

export interface Workspace {
  WorkspaceID: number;
  WorkspaceName: string;

  Description: string | null;
  CreatedAt: string;
}

export interface Content {
  ContentID: number;
  WorkspaceID: number;
  Title: string;
  FilePath: string | null;
  TextContent: string | null;
  Description: string | null;
  ContentType: ContentType;
  CreatedAt: string;
  ModifiedAt: string;
}

export interface Tag 
{
  TagID: number;
  WorkspaceID: number;
  TagName: string;
  HexColor: string;
}

export interface ContentWithTags extends Content {
  tags: Tag[];
}

export interface Collection 
{
  CollectionID: number;
  WorkspaceID: number;
  CollectionName: string;
  Description: string | null;
  CreatedAt: string;
}

export interface SavedSearch 
{
  SavedSearchID: number;
  WorkspaceID: number;
  SearchName: string;
  ContentType: ContentType | null;
  CreatedAt: string;
}

export interface Snapshot {
  SnapshotID: number;
  WorkspaceID: number;
  SnapshotName: string;
  SnapshotTime: string;
  CreatedAt: string;
}

//small helper so every call handles errors the same way

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {

    throw new Error(`Request failed (${res.status}): ${url}`);
  }
  
  return res.json() as Promise<T>;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> 
{
  const res = await fetch(url, 
	{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
	
  });
  if (!res.ok) {

    throw new Error(`Request failed (${res.status}): ${url}`);
  }
  
  return res.json() as Promise<T>;
}

//workspaces

export function getWorkspaces(): Promise<Workspace[]> {
  return getJSON<Workspace[]>(`${API_BASE}/workspaces`);
}

export function createWorkspace(data: {
  WorkspaceName: string;
  Description?: string;
}): Promise<Workspace> {
  return postJSON<Workspace>(`${API_BASE}/workspaces`,data);
}

//content

export function getWorkspaceContent(workspaceId: number): Promise<Content[]> 
{
  return getJSON<Content[]>(`${API_BASE}/workspaces/${workspaceId}/content`);
}

export function getContent(contentId: number): Promise<ContentWithTags> 
{
  return getJSON<ContentWithTags>(`${API_BASE}/content/${contentId}`);
}

//the tags

export function getWorkspaceTags(workspaceId: number): Promise<Tag[]> 
{
  return getJSON<Tag[]>(`${API_BASE}/workspaces/${workspaceId}/tags`);
}

export function createTag(data: {
  WorkspaceID: number;
  TagName: string;
  HexColor: string;

}): Promise<Tag> 
{
  return postJSON<Tag>(`${API_BASE}/tags`, data);
}

//collections
//

export function getWorkspaceCollections(
  workspaceId: number
): Promise<Collection[]> 
{
  return getJSON<Collection[]>(
    `${API_BASE}/workspaces/${workspaceId}/collections`
  );
}

export function getCollectionContent(collectionId: number): Promise<Content[]> {

  return getJSON<Content[]>(`${API_BASE}/collections/${collectionId}/content`);
}

// saved searches

export function getWorkspaceSavedSearches(

  workspaceId: number

): Promise<SavedSearch[]> 
{
  return getJSON<SavedSearch[]>(
    `${API_BASE}/workspaces/${workspaceId}/saved-searches`
  );
}

// snapshots
export function getWorkspaceSnapshots(workspaceId: number): Promise<Snapshot[]> {
  return getJSON<Snapshot[]>(`${API_BASE}/workspaces/${workspaceId}/snapshots`);
}