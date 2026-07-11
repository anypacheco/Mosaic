USE Mosaic;

-- WORKSPACES
INSERT INTO Workspace (WorkspaceName, Description) VALUES
('Personal', 'Personal projects, reflection, and creative experiments'),
('Work', 'Professional design and system work'),
('School', 'Academic learning and research'),
('Side Projects', 'Creative startups and artistic exploration');

-- TAGS (WITH HEX COLORS)
INSERT INTO Tag (WorkspaceID, TagName, HexColor) VALUES

-- Personal
(1,'Creativity','#FF6B6B'),
(1,'Mindfulness','#4ECDC4'),
(1,'Journaling','#FFE66D'),
(1,'Self-Reflection','#5E60CE'),
(1,'Dreams','#9B5DE5'),

-- Work
(2,'Innovation','#1D3557'),
(2,'Leadership','#457B9D'),
(2,'Productivity','#2A9D8F'),
(2,'Strategy','#E63946'),
(2,'Collaboration','#A8DADC'),

-- School
(3,'Research','#264653'),
(3,'Critical Thinking','#8D99AE'),
(3,'STEM','#EF233C'),
(3,'Literature','#6D597A'),
(3,'Problem Solving','#F77F00'),

-- Side Projects
(4,'Entrepreneurship','#606C38'),
(4,'Design Thinking','#283618'),
(4,'Storytelling','#DDA15E'),
(4,'Tech','#BC6C25'),
(4,'Branding','#FEFAE0');

-- CONTENT
-- Note: ContentType uses ENUM string literals ('Markdown','PDF','Image','Audio','Video')

INSERT INTO Content (WorkspaceID, Title, ContentType, TextContent, FilePath, Description) VALUES

-- Personal
(1, 'Morning Reflection', 'Markdown', 'Thoughts on clarity and intention', NULL, 'Journal entry'),
(1, 'Poem: Moonlight', 'Markdown', 'Poetic writing', NULL, 'Poetry draft'),
(1, 'Growth Notes', 'PDF', NULL, '/files/personal/growth.pdf', 'Self development PDF'),
(1, 'Dream Collage', 'Image', NULL, '/files/personal/dream.png', 'Visual subconscious board'),
(1, 'Ambient Loop', 'Audio', NULL, '/files/personal/ambient.mp3', 'Experimental sound'),

-- Work
(2, 'Sprint Planning', 'Markdown', 'Team roadmap and priorities', NULL, 'Agile notes'),
(2, 'System Design', 'PDF', NULL, '/files/work/system.pdf', 'Architecture document'),
(2, 'UI Mockups', 'Image', NULL, '/files/work/ui.png', 'Interface designs'),
(2, 'Team Presentation', 'Video', NULL, '/files/work/pitch.mp4', 'Recorded meeting'),

-- School
(3, 'AI Lecture Notes', 'Markdown', 'Machine learning concepts', NULL, 'Study notes'),
(3, 'AI Ethics Paper', 'PDF', NULL, '/files/school/ai.pdf', 'Research paper'),
(3, 'Lab Diagram', 'Image', NULL, '/files/school/lab.png', 'Scientific diagram'),
(3, 'Recorded Lecture', 'Video', NULL, '/files/school/lecture.mp4', 'Class recording'),

-- Side Projects
(4, 'Startup Idea', 'Markdown', 'AI creative assistant concept', NULL, 'Ideation'),
(4, 'Brand Guide', 'PDF', NULL, '/files/side/brand.pdf', 'Identity system'),
(4, 'Logo Concepts', 'Image', NULL, '/files/side/logo.png', 'Design iterations'),
(4, 'Pitch Audio', 'Audio', NULL, '/files/side/pitch.mp3', 'Investor narration');


-- FILE METADATA
INSERT INTO File_Metadata (ContentID, FileSize, FileExtension, ExtractedTextAvailable) VALUES
(3,1200000,'pdf',TRUE),
(4,800000,'png',FALSE),
(5,3000000,'mp3',FALSE),
(7,2500000,'pdf',TRUE),
(8,900000,'png',FALSE),
(9,60000000,'mp4',FALSE),
(12,2000000,'pdf',TRUE),
(13,1800000,'png',FALSE),
(14,70000000,'mp4',FALSE),
(15,1500000,'pdf',TRUE),
(16,2200000,'png',FALSE),
(17,5000000,'mp3',FALSE);

-- COLLECTIONS
INSERT INTO Collection (WorkspaceID, CollectionName, Description) VALUES
(1,'Journal Space','Writing and reflection'),
(1,'Audio Experiments','Sound exploration'),
(2,'Product Design','UI and systems'),
(2,'Team Planning','Work strategy'),
(3,'Academic Research','Papers and study'),
(3,'Lecture Archive','Recorded knowledge'),
(4,'Startup Ideas','Entrepreneurial work'),
(4,'Brand Identity','Design systems');

-- COLLECTION CONTENT
INSERT INTO Collection_Content (CollectionID, ContentID) VALUES
(1,1),(1,2),
(2,5),
(3,7),(3,8),
(4,6),(4,9),
(5,10),(5,11),
(6,13),
(7,14),(7,15),
(8,16),(8,17);

-- CONTENT TAGS
INSERT INTO Content_Tag (ContentID, TagID) VALUES
(1,1),(1,2),
(2,1),
(3,1),(3,4),
(4,5),
(5,5),

(6,8),(6,9),
(7,7),(7,9),
(8,10),
(9,8),

(10,11),(10,12),
(11,11),
(12,13),

(13,14),(13,15),
(14,16),
(15,20),
(16,16),

(17,17),
(17,18);

-- SAVED SEARCHES
INSERT INTO Saved_Search (WorkspaceID, SearchName, ContentType) VALUES
(1,'Writing','Markdown'),
(1,'Audio Works','Audio'),
(2,'Design Docs','PDF'),
(3,'Research Papers','PDF'),
(4,'Brand Assets','Image'),
(4,'Pitch Audio','Audio');

-- SAVED SEARCH TAGS
INSERT INTO SavedSearch_Tag (SavedSearchID, TagID) VALUES
(1,1),(1,2),
(2,5),
(3,9),
(4,11),
(5,17),
(6,18);

-- SNAPSHOTS
INSERT INTO Snapshot (WorkspaceID, SnapshotName, SnapshotTime) VALUES
(1,'Personal Studio Start','2026-01-01 10:00:00'),
(2,'Work Phase','2026-01-03 12:00:00'),
(3,'Mid Semester','2026-01-05 09:00:00'),
(4,'Startup Phase','2026-01-07 11:00:00');

-- SNAPSHOT CONTENT
INSERT INTO Snapshot_Content (SnapshotID, ContentID) VALUES
(1,1),(1,2),(1,4),
(2,6),(2,7),(2,9),
(3,10),(3,11),(3,12),
(4,13),(4,15),(4,17);

-- CONTENT SEARCH INDEX 
INSERT INTO Content_Search_Index (ContentID, ExtractedText, WordCount) VALUES
(1,'reflection journal clarity intention creativity',6),
(2,'poetry emotional fragmented writing artistic expression',6),
(3,'self growth learning development personal reflection',6),
(4,'dream subconscious visual surreal collage imagery',6),
(5,'ambient sound experimental loop texture music',6),

(6,'agile sprint planning productivity teamwork strategy',6),
(7,'system architecture backend design scalable structure',6),
(8,'ui mockups interface design product visuals',6),
(9,'team presentation recorded collaboration communication',6),

(10,'machine learning lecture ai concepts study notes',6),
(11,'ai ethics research neural networks responsibility',6),
(12,'biology lab diagram scientific visualization study',6),
(13,'lecture recording academic learning education knowledge',6),

(14,'startup idea creative assistant innovation tech concept',6),
(15,'brand identity design typography visual system',6),
(16,'logo iterations sketch branding design exploration',6),
(17,'pitch audio storytelling investor presentation spoken',6);