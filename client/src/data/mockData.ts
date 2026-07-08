export type ContentType = "Markdown" | "PDF" | "Image" | "Audio" | "Video";

export const workspaces = [
  {
    WorkspaceID: 1,
    WorkspaceName: "Personal",
    Description: "Personal projects and notes",
    CreatedAt: "2026-01-01",
  },
  {
    WorkspaceID: 2,
    WorkspaceName: "School",
    Description: "School projects and notes",
    CreatedAt: "2026-01-01",
  },
  {
    WorkspaceID: 3,
    WorkspaceName: "Work",
    Description: "Work related stuff",
    CreatedAt: "2026-01-01",
  },
];

export const content = [
  {
    ContentID: 1,
    WorkspaceID: 1,
    Title: "Notes.md",
    FilePath: "/files/Notes.md",
    TextContent: "Notes about algorithms and data structures",
    Description: "Class homework notes",
    ContentType: "Markdown" as ContentType,
    CreatedAt: "2026-01-01",
    ModifiedAt: "2026-01-05",
  },
  {
    ContentID: 2,
    WorkspaceID: 1,
    Title: "Lecture Slides.pdf",
    FilePath: "/files/lecture-slides.pdf",
    TextContent: null,
    Description: "Lecture PDF",
    ContentType: "PDF" as ContentType,
    CreatedAt: "2026-01-02",
    ModifiedAt: "2026-01-02",
  },
  {
    ContentID: 3,
    WorkspaceID: 1,
    Title: "ERD.png",
    FilePath: "/files/ERD.png",
    TextContent: null,
    Description: "Sorting diagram",
    ContentType: "Image" as ContentType,
    CreatedAt: "2026-01-03",
    ModifiedAt: "2026-01-03",
  },
  {
    ContentID: 4,
    WorkspaceID: 1,
    Title: "Algorithm Walkthrough.mp3",
    FilePath: "/files/algorithm-walkthrough.mp3",
    TextContent: null,
    Description: "Audio explanation",
    ContentType: "Audio" as ContentType,
    CreatedAt: "2026-01-04",
    ModifiedAt: "2026-01-04",
  },
];

export const tags = [
  { TagID: 1, WorkspaceID: 1, TagName: "Algorithms", HexColor: "#9B5DE5" },
  { TagID: 2, WorkspaceID: 1, TagName: "Data Structures", HexColor: "#00BBF9" },
  { TagID: 3, WorkspaceID: 1, TagName: "Homework", HexColor: "#00F5A0" },
];

export const contentTags = [
  { ContentID: 1, TagID: 1 },
  { ContentID: 1, TagID: 2 },
  { ContentID: 1, TagID: 3 },
  { ContentID: 2, TagID: 1 },
  { ContentID: 3, TagID: 2 },
  { ContentID: 4, TagID: 1 },
];

export const collections = [
  {
    CollectionID: 1,
    WorkspaceID: 1,
    CollectionName: "Algorithms",
    Description: "Algorithm-related tesserae",
    CreatedAt: "2026-01-01",
  },
  {
    CollectionID: 2,
    WorkspaceID: 1,
    CollectionName: "Data Structures",
    Description: "Data structure resources",
    CreatedAt: "2026-01-01",
  },
];

export const collectionContent = [
  { CollectionID: 1, ContentID: 1, AddedAt: "2026-01-01" },
  { CollectionID: 1, ContentID: 2, AddedAt: "2026-01-02" },
  { CollectionID: 2, ContentID: 1, AddedAt: "2026-01-03" },
  { CollectionID: 2, ContentID: 3, AddedAt: "2026-01-04" },
];

export const savedSearches = [
  {
    SavedSearchID: 1,
    WorkspaceID: 1,
    SearchName: "Algorithms PDFs",
    ContentType: "PDF" as ContentType,
    CreatedAt: "2026-01-05",
  },
];

export const savedSearchTags = [
  { SavedSearchID: 1, TagID: 1 },
];

export const snapshots = [
  {
    SnapshotID: 1,
    WorkspaceID: 1,
    SnapshotName: "Week 1",
    SnapshotTime: "2026-01-07 10:00:00",
    CreatedAt: "2026-01-07",
  },
];

export const snapshotContent = [
  { SnapshotID: 1, ContentID: 1 },
  { SnapshotID: 1, ContentID: 2 },
];