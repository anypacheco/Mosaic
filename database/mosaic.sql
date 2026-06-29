DROP DATABASE IF EXISTS Mosaic;
CREATE DATABASE Mosaic;
USE Mosaic;

CREATE TABLE IF NOT EXISTS Workspace (
    WorkspaceID INT AUTO_INCREMENT,
    WorkspaceName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (WorkspaceID),
    UNIQUE (WorkspaceName)
);

CREATE TABLE IF NOT EXISTS ContentType (
    ContentTypeID INT AUTO_INCREMENT,
    TypeName VARCHAR(50) NOT NULL,
    PRIMARY KEY(ContentTypeID),
    UNIQUE(TypeName)
);

CREATE TABLE IF NOT EXISTS Workspace_ContentType (
    WorkspaceID INT,
    ContentTypeID INT,
    PRIMARY KEY (WorkspaceID, ContentTypeID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    FOREIGN KEY (ContentTypeID)
        REFERENCES ContentType(ContentTypeID)
);

CREATE TABLE IF NOT EXISTS Content (
    ContentID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    ContentTypeID INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    FilePath VARCHAR(500),
    TextContent TEXT,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(ContentID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    FOREIGN KEY (ContentTypeID)
        REFERENCES ContentType(ContentTypeID),
    UNIQUE(WorkspaceID, Name),
    CHECK (
        FilePath IS NOT NULL
        OR
        TextContent IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS Tag (
    TagID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    Keyword VARCHAR(100) NOT NULL,
    HexCode CHAR(7),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(TagID),
    FOREIGN KEY (WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE(WorkspaceID, Keyword),
    CHECK(HexCode IS NULL OR HexCode REGEXP '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE IF NOT EXISTS Content_Tag (
    ContentID INT,
    TagID INT,
    PRIMARY KEY(ContentID, TagID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    FOREIGN KEY(TagID)
        REFERENCES Tag(TagID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Collection (
    CollectionID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    CollectionName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(CollectionID),
    FOREIGN KEY(WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE,
    UNIQUE(WorkspaceID, CollectionName)
);

CREATE TABLE IF NOT EXISTS Collection_Content (
    CollectionID INT,
    ContentID INT,
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(CollectionID, ContentID),
    FOREIGN KEY(CollectionID)
        REFERENCES Collection(CollectionID)
        ON DELETE CASCADE,
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS File_Metadata (
    MetadataID INT AUTO_INCREMENT,
    ContentID INT NOT NULL,
    FileSize BIGINT,
    FileExtension VARCHAR(20),
    ExtractedTextAvailable BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(MetadataID),
    UNIQUE(ContentID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    CHECK(FileSize >= 0)
);

CREATE TABLE IF NOT EXISTS Saved_Search (
    SavedSearchID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    SearchName VARCHAR(100) NOT NULL,
    SearchQuery TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(SavedSearchID),
    FOREIGN KEY(WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Snapshot (
    SnapshotID INT AUTO_INCREMENT,
    WorkspaceID INT NOT NULL,
    SnapshotName VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    SnapshotData JSON,
    PRIMARY KEY(SnapshotID),
    FOREIGN KEY(WorkspaceID)
        REFERENCES Workspace(WorkspaceID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Note (
    ContentID INT,
    PRIMARY KEY(ContentID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    CHECK(ContentID > 0)
);

CREATE TABLE IF NOT EXISTS PDF (
    ContentID INT,
    PRIMARY KEY(ContentID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Image (
    ContentID INT,
    Width INT,
    Height INT,
    PRIMARY KEY(ContentID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    CHECK(Width > 0),
    CHECK(Height > 0)
);

CREATE TABLE IF NOT EXISTS AudioVideo (
    ContentID INT,
    DurationSeconds INT,
    PRIMARY KEY(ContentID),
    FOREIGN KEY(ContentID)
        REFERENCES Content(ContentID)
        ON DELETE CASCADE,
    CHECK(DurationSeconds >= 0)
);