DROP DATABASE IF EXISTS Mosaic;
CREATE DATABASE Mosaic;
USE Mosaic;


CREATE TABLE Workspace (
    WorkspaceID INT AUTO_INCREMENT,
    WorkspaceName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (WorkspaceID),
    UNIQUE (WorkspaceName)
);

CREATE TABLE Collection (
    CollectionID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    CollectionName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (CollectionID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE (WorkspaceID, CollectionName)
);

CREATE TABLE Content (
    ContentID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    ContentType ENUM('Markdown','PDF','Image','Audio','Video') NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ContentID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE (WorkspaceID, Title),
    UNIQUE (WorkspaceID, FilePath)
);

CREATE TABLE Tag (
    TagID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    TagName VARCHAR(100) NOT NULL,
    HexColor CHAR(7) NOT NULL,
    PRIMARY KEY (TagID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE (WorkspaceID, TagName),
    CHECK (HexColor REGEXP '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE Saved_Search (
    SavedSearchID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    SearchName VARCHAR(100) NOT NULL,
    ContentType ENUM('Markdown','PDF','Image','Audio','Video'),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SavedSearchID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE (WorkspaceID, SearchName)
);

CREATE TABLE Snapshot (
    SnapshotID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    SnapshotName VARCHAR(100) NOT NULL,
    SnapshotTime DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SnapshotID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE
);

CREATE TABLE File_Metadata (
    MetadataID INT AUTO_INCREMENT,
    ContentID INT NOT NULL,
    FileSize BIGINT NOT NULL,
    FileExtension VARCHAR(10) NOT NULL,
    ExtractedTextAvailable BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (MetadataID),
    UNIQUE (ContentID),
    FOREIGN KEY (ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    CHECK (FileSize >= 0)
);

CREATE TABLE Content_Search_Index (
    SearchIndexID INT AUTO_INCREMENT,
    ContentID INT NOT NULL,
    ExtractedText LONGTEXT,
    WordCount INT DEFAULT 0,
    IndexedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SearchIndexID),
    FOREIGN KEY (ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE
);

CREATE TABLE Collection_Content (
    CollectionID INT,
    ContentID INT,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (CollectionID, ContentID),
    FOREIGN KEY (CollectionID)
        REFERENCES Collection(CollectionID)
        ON DELETE CASCADE,
    FOREIGN KEY (ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE
);

CREATE TABLE Content_Tag (
    ContentID INT,
    TagID INT,
    PRIMARY KEY (ContentID, TagID),
    FOREIGN KEY (ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    FOREIGN KEY (TagID)
        REFERENCES Tag(TagID)
        ON DELETE CASCADE
);

CREATE TABLE SavedSearch_Tag (
    SavedSearchID INT,
    TagID INT,
    PRIMARY KEY (SavedSearchID, TagID),
    FOREIGN KEY (SavedSearchID)
        REFERENCES Saved_Search(SavedSearchID)
        ON DELETE CASCADE,
    FOREIGN KEY (TagID)
        REFERENCES Tag(TagID)
        ON DELETE CASCADE
);

CREATE TABLE Snapshot_Content (
    SnapshotID INT,
    ContentID INT,
    PRIMARY KEY (SnapshotID, ContentID),
    FOREIGN KEY (SnapshotID)
        REFERENCES Snapshot(SnapshotID)
        ON DELETE CASCADE,
    FOREIGN KEY (ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE
);
