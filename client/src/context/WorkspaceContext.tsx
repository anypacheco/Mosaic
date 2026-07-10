

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";


import {
  getWorkspaces,
  getWorkspaceContent,
  getWorkspaceTags,
  getWorkspaceCollections,
  getWorkspaceSnapshots,
  getWorkspaceSavedSearches,
  type Workspace,
  type Content,
  type Tag,
  type Collection,
  type Snapshot,
  type SavedSearch,
} from "../api/client";

//what the rest of the app can read from the context
interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<Workspace[]>;
  content: Content[];
  tags: Tag[];
  collections: Collection[];
  savedSearches: SavedSearch[];
  snapshots: Snapshot[];
  loading: boolean;
  error: string | null;
  refreshWorkspaceData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces]=useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace]=useState<Workspace | null>(
    null
  );
  const [content, setContent] =useState<Content[]>([]);
  const [tags, setTags] =useState<Tag[]>([]);
  const [collections, setCollections] =useState<Collection[]>([]);

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [snapshots, setSnapshots] =useState<Snapshot[]>([]);

  const [loading, setLoading] =useState(true);

  const [error, setError] =useState<string | null>(null);

  //load list of workspaces once on first render
  
  useEffect(() => {
    getWorkspaces()
      .then((data) => 
		{
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Could not reach the server. Make sure the backend is running on port 3000."
        );
        setLoading(false);
      });
  }, []);

  // refetches workspace list (used after creating/ deleting a workspace)
  async function refreshWorkspaces(): Promise<Workspace[]> {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(
        "Could not reach the server. Make sure the backend is running on port 3000."
      );
      return [];
    }
  }

  // refetches everything for the current workspace (content, tags, collections, saved searches, snapshots)
  async function refreshWorkspaceData(): Promise<void> {
    if (!currentWorkspace) return;

    setLoading(true);
    setError(null);

    const id=currentWorkspace.WorkspaceID;

    try {
      const [contentData, tagData, collectionData, savedSearchData, snapshotData] =
        await Promise.all([
          getWorkspaceContent(id),
          getWorkspaceTags(id),
          getWorkspaceCollections(id),
          getWorkspaceSavedSearches(id),
          getWorkspaceSnapshots(id),
        ]);

      setContent(contentData);
      setTags(tagData);
      setCollections(collectionData);
      setSavedSearches(savedSearchData);
      setSnapshots(snapshotData);
    } 
	catch (err) {
      console.error(err);
      setError("Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  }

  //whenever selected workspace changes, load all of its data
  useEffect(() => {
    refreshWorkspaceData();

  }, [currentWorkspace]);

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    refreshWorkspaces,
    content,
    tags,
    collections,
    savedSearches,
    snapshots,
    loading,
    error,
    refreshWorkspaceData,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

//little helper hook so that the components can just call useWorkspace()
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}