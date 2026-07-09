

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} 

from "react";


import {
  getWorkspaces,
  getWorkspaceContent,
  getWorkspaceTags,
  getWorkspaceCollections,
  getWorkspaceSnapshots,
  type Workspace,
  type Content,
  type Tag,
  type Collection,
  type Snapshot,
} 

from "../api/client";

// this is what the rest of the app can read from the context
interface WorkspaceContextValue 
{
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) =>void;

  content: Content[];
  tags: Tag[];
  collections: Collection[];
  snapshots: Snapshot[];

  loading: boolean;
  error: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue |undefined>(
  undefined
);

export function WorkspaceProvider({children }: {children: ReactNode }) 
{
  const [workspaces, setWorkspaces]= useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace]= useState<Workspace | null>(
    null
  );


  const [content, setContent] =useState<Content[]>([]);
  const [tags, setTags] =useState<Tag[]>([]);

  const [collections, setCollections] =useState<Collection[]>([]);
  const [snapshots, setSnapshots]= useState<Snapshot[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError]= useState<string | null>(null);

  // Load the list of workspaces once, on first render
  useEffect(() => {
    getWorkspaces()
      .then((data) => 
		{
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      })

      .catch((err) => 
		{
        console.error(err);
        setError(
          "Could not reach the server. Make sure the backend is running on port 3000."
        );
        setLoading(false);
      });
  }, []);

  //whenever the selected workspace changes, load all of its data
  useEffect(() => {
    if (!currentWorkspace) return;

    setLoading(true);
    setError(null);

    const id=currentWorkspace.WorkspaceID;

    Promise.all([
      getWorkspaceContent(id),
      getWorkspaceTags(id),
      getWorkspaceCollections(id),
      getWorkspaceSnapshots(id),
    ])
      .then(([contentData, tagData, collectionData, snapshotData]) => 
		{
        setContent(contentData);
        setTags(tagData);
        setCollections(collectionData);
        setSnapshots(snapshotData);
      })
      .catch((err) => {
        console.error(err);

        setError("Failed to load workspace data.");
      })
	  
      .finally(() => setLoading(false));
  }, [currentWorkspace]);

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    content,
    tags,
    collections,
    snapshots,
    loading,
    error,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

//little helper hook so that the components can just call useWorkspace()
export function useWorkspace(): WorkspaceContextValue 
{
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;

}