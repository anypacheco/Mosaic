USE Mosaic;

-- SELECT STATEMENTS 
SELECT * FROM Workspace;
SELECT * FROM Collection;
SELECT * FROM Content;
SELECT * FROM Tag;
SELECT * FROM Saved_Search;
SELECT * FROM Snapshot;
SELECT * FROM File_Metadata;
SELECT * FROM Content_Search_Index;

-- FILTER Queries
-- Find all Markdown content
SELECT * FROM Content
WHERE ContentType = 'Markdown';

-- Find all content in Personal workspace
SELECT * FROM Content
WHERE WorkspaceID = 1;

-- Find content that's larger than 500 MB
SELECT ContentID FROM File_Metadata
WHERE FileSize > 524288000;

-- SUMMARY Queries

DESCRIBE Workspace;
DESCRIBE Content;
DESCRIBE Tag;
DESCRIBE File_Metadata;
DESCRIBE Content_Search_Index;
DESCRIBE Collection;
DESCRIBE Saved_Search;
DESCRIBE Snapshot;

-- Count content per workspace
SELECT WorkspaceID, COUNT(*) AS TotalContent
FROM Content
GROUP BY WorkspaceID;

-- Count tags per content
SELECT ContentID, COUNT(TagID) AS TagCount
FROM Content_Tag
GROUP BY ContentID;


-- JOIN Queries
-- Content with tags
SELECT c.Title, t.TagName
FROM Content c
JOIN Content_Tag ct ON c.ContentID = ct.ContentID
JOIN Tag t ON ct.TagID = t.TagID;

-- Collections with content
SELECT col.CollectionName, c.Title
FROM Collection col
JOIN Collection_Content cc ON col.CollectionID = cc.CollectionID
JOIN Content c ON cc.ContentID = c.ContentID;

-- Snapshots with content
SELECT s.SnapshotName, c.Title
FROM Snapshot s
JOIN Snapshot_Content sc ON s.SnapshotID = sc.SnapshotID
JOIN Content c ON sc.ContentID = c.ContentID;

-- Saved searches with tags
SELECT ss.SearchName, t.TagName
FROM Saved_Search ss
JOIN SavedSearch_Tag st ON ss.SavedSearchID = st.SavedSearchID
JOIN Tag t ON st.TagID = t.TagID;

-- Content + metadata + search index
SELECT c.Title, fm.FileSize, csi.WordCount
FROM Content c
JOIN File_Metadata fm ON c.ContentID = fm.ContentID
JOIN Content_Search_Index csi ON c.ContentID = csi.ContentID;


-- ASSOCIATIVE Index Queries
-- Content_Tag details
SELECT c.Title, t.TagName
FROM Content_Tag ct
JOIN Content c ON ct.ContentID = c.ContentID
JOIN Tag t ON ct.TagID = t.TagID;

-- Collection_Content details
SELECT col.CollectionName, c.Title
FROM Collection_Content cc
JOIN Collection col ON cc.CollectionID = col.CollectionID
JOIN Content c ON cc.ContentID = c.ContentID;

-- SavedSearch_Tag details
SELECT ss.SearchName, t.TagName
FROM SavedSearch_Tag st
JOIN Saved_Search ss ON st.SavedSearchID = ss.SavedSearchID
JOIN Tag t ON st.TagID = t.TagID;

-- Snapshot_Content details
SELECT s.SnapshotName, c.Title
FROM Snapshot_Content sc
JOIN Snapshot s ON sc.SnapshotID = s.SnapshotID
JOIN Content c ON sc.ContentID = c.ContentID;