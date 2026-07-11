const express=require('express');
const cors=require('cors');
const db=require('../database/db');
const multer = require('multer');
const path = require('path');

const app=express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload setup
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const safeName = `${Date.now()}-${file.originalname}`;
        cb(null, safeName);
    },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({
        filePath: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
    });
});

//health check 

app.get('/', (req, res) => {
    res.json({ status: 'Mosaic server is running', timestamp: new Date().toISOString() });
});

// workspace routes
// GET all workspaces
app.get('/api/workspaces', async (req, res) => {
    try {
        const workspaces = await db.query('SELECT * FROM Workspace ORDER BY CreatedAt DESC');
        res.json(workspaces);

    } catch (error) {
        console.error('Error fetching workspaces:',error);
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});

// GET workspace by ID
app.get('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await db.query('SELECT * FROM Workspace WHERE WorkspaceID = ?', [id]);
        if (workspace.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json(workspace[0]);
    } catch (error) {
        console.error('Error fetching workspace:', error);
		
        res.status(500).json({ error: 'Failed to fetch workspace' });
    }
});

// POST create new workspace
app.post('/api/workspaces', async (req, res) => {
    try {
        const { WorkspaceName, Description } = req.body;
        if (!WorkspaceName) {
            return res.status(400).json({ error: 'WorkspaceName is required' });

        }
        const result = await db.query('INSERT INTO Workspace (WorkspaceName, Description) VALUES (?, ?)', 
            [WorkspaceName, Description || null]);
        res.status(201).json({ WorkspaceID: result.insertId, WorkspaceName, Description });
		
    } catch (error) 
	{
        console.error('Error creating workspace:', error);
        res.status(500).json({ error: 'Failed to create workspace' });
    }
});

// delete a workspace (cascades to its content, tags, collections, etc.)
app.delete('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM Workspace WHERE WorkspaceID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        res.status(500).json({ error: 'Failed to delete workspace' });
    }
});

//content routes
// GET all content in a workspace

app.get('/api/workspaces/:workspaceId/content', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const content = await db.query(
            'SELECT * FROM Content WHERE WorkspaceID = ? ORDER BY CreatedAt DESC',
            [workspaceId]
        );


        res.json(content);
    } catch (error) 
	{
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// GET content by ID with its tags
app.get('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await db.query('SELECT * FROM Content WHERE ContentID = ?', [id]);
        if (content.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // get associated tags
        const tags = await db.query(
            `SELECT t.* FROM Tag t
             JOIN Content_Tag ct ON t.TagID = ct.TagID
             WHERE ct.ContentID = ?`,
            [id]
        );

        res.json({ ...content[0], tags });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// GET collections associated with content
app.get('/api/content/:contentId/collections', async (req, res) => {
    try {
        const { contentId } = req.params;

        const collections = await db.query(
            `SELECT col.* FROM Collection col
             JOIN Collection_Content cc ON col.CollectionID = cc.CollectionID
             WHERE cc.ContentID = ?
             ORDER BY col.CollectionName`,
            [contentId]
        );

        res.json(collections);
    } catch (error) {
        console.error('Error fetching content collections:', error);
        res.status(500).json({ error: 'Failed to fetch content collections' });
    }
});

// POST create new content
app.post('/api/content', async (req, res) => {
    try {
        const { WorkspaceID, Title, ContentType, TextContent, FilePath, Description } = req.body;
        if (!WorkspaceID || !Title || !ContentType) {
            return res.status(400).json({ error: 'WorkspaceID, Title, and ContentType are required' });
        }

        // either TextContent or FilePath must be provided
        if (!TextContent && !FilePath) {
            return res.status(400).json({ error: 'Either TextContent or FilePath must be provided' });
        }

        const result = await db.query(
            'INSERT INTO Content (WorkspaceID, Title, ContentType, TextContent, FilePath, Description) VALUES (?, ?, ?, ?, ?, ?)',
            [WorkspaceID, Title, ContentType, TextContent || null, FilePath || null, Description || null]
        );

        res.status(201).json({ ContentID: result.insertId, WorkspaceID, Title, ContentType });
    } catch (error) 
	{
        console.error('Error creating content:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

// PATCH update content by ID
app.patch('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Description, TextContent } = req.body;

        if (TextContent !== undefined && TextContent.trim() === '') {
            return res.status(400).json({ error: 'Markdown content cannot be blank' });
        }

        const updates = [];
        const values = [];

        if (Description !== undefined) {
            updates.push('Description = ?');
            values.push(Description);
        }

        if (TextContent !== undefined) {
            updates.push('TextContent = ?');
            values.push(TextContent);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        const result = await db.query(
            `UPDATE Content SET ${updates.join(', ')} WHERE ContentID = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

// DELETE content by ID
app.delete('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM Content WHERE ContentID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

// tag routes
// GET all tags in a workspace

app.get('/api/workspaces/:workspaceId/tags', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const tags = await db.query(
            'SELECT * FROM Tag WHERE WorkspaceID = ? ORDER BY TagName',
            [workspaceId]
        );

        res.json(tags);

    } catch (error) 
	{
        console.error('Error fetching tags:',error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// POST create new tag
app.post('/api/tags', async (req, res) => {
    try {
        const { WorkspaceID, TagName, HexColor } = req.body;
        if (!WorkspaceID || !TagName || !HexColor) {
            return res.status(400).json({ error: 'WorkspaceID, TagName, and HexColor are required' });
        }

        const result = await db.query(
            'INSERT INTO Tag (WorkspaceID, TagName, HexColor) VALUES (?, ?, ?)',
            [WorkspaceID, TagName, HexColor]
        );
        res.status(201).json({ TagID: result.insertId, WorkspaceID, TagName, HexColor });
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

// Content_Tag association routes
// POST associate a tag with content

app.post('/api/content/:contentId/tags/:tagId', async (req, res) => {
    try {
        const { contentId, tagId } = req.params;
        await db.query(
            'INSERT IGNORE INTO Content_Tag (ContentID, TagID) VALUES (?, ?)',
            [contentId, tagId]
        );

        res.status(201).json({ ContentID: contentId, TagID: tagId });
    } catch (error) 
	{
        console.error('Error associating tag:', error);
        res.status(500).json({ error: 'Failed to associate tag' });
    }
});

// DELETE remove a tag from content
app.delete('/api/content/:contentId/tags/:tagId', async (req, res) => {
    try {
        const { contentId, tagId } = req.params;
        await db.query(
            'DELETE FROM Content_Tag WHERE ContentID = ? AND TagID = ?',
            [contentId, tagId]
        );

        res.json({ success: true });
    } catch (error) 
	{
        console.error('Error removing tag:', error);
        res.status(500).json({ error: 'Failed to remove tag' });
    }
});

// collection routes
// GET all collections in a workspace

app.get('/api/workspaces/:workspaceId/collections', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const collections = await db.query(
            'SELECT * FROM Collection WHERE WorkspaceID = ? ORDER BY CreatedAt DESC',
            [workspaceId]
        );

        res.json(collections);

    } catch (error) 
	{
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

// POST create new collection
app.post('/api/collections', async (req, res) => {
    try {
        const { WorkspaceID, CollectionName, Description } = req.body;

        if (!WorkspaceID || !CollectionName) {
            return res.status(400).json({ error: 'WorkspaceID and CollectionName are required' });
        }

        const result = await db.query(
            'INSERT INTO Collection (WorkspaceID, CollectionName, Description) VALUES (?, ?, ?)',
            [WorkspaceID, CollectionName, Description || null]
        );

        res.status(201).json({
            CollectionID: result.insertId,
            WorkspaceID,
            CollectionName,
            Description: Description || null,
        });
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

// DELETE collection by ID
app.delete('/api/collections/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM Collection WHERE CollectionID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// GET collection with its content
app.get('/api/collections/:id/content', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await db.query(
            `SELECT c.* FROM Content c
             JOIN Collection_Content cc ON c.ContentID = cc.ContentID
             WHERE cc.CollectionID = ? ORDER BY cc.AddedAt DESC`,
            [id]
        );
        res.json(content);
    } catch (error) 
	{
        console.error('Error fetching collection content:', error);
        res.status(500).json({ error: 'Failed to fetch collection content' });
    }
});

// POST add content to a collection
app.post('/api/collections/:collectionId/content/:contentId', async (req, res) => {
    try {
        const { collectionId, contentId } = req.params;

        await db.query(
            'INSERT IGNORE INTO Collection_Content (CollectionID, ContentID) VALUES (?, ?)',
            [collectionId, contentId]
        );

        res.status(201).json({ CollectionID: collectionId, ContentID: contentId });
    } catch (error) {
        console.error('Error adding content to collection:', error);
        res.status(500).json({ error: 'Failed to add content to collection' });
    }
});

// DELETE remove content from a collection
app.delete('/api/collections/:collectionId/content/:contentId', async (req, res) => {
    try {
        const { collectionId, contentId } = req.params;

        await db.query(
            'DELETE FROM Collection_Content WHERE CollectionID = ? AND ContentID = ?',
            [collectionId, contentId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing content from collection:', error);
        res.status(500).json({ error: 'Failed to remove content from collection' });
    }
});

// saved search routes
// GET all saved searches in a workspace
app.get('/api/workspaces/:workspaceId/saved-searches', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const searches = await db.query(
            'SELECT * FROM Saved_Search WHERE WorkspaceID = ? ORDER BY CreatedAt DESC',
            [workspaceId]
        );
        res.json(searches);
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
});

// GET tags associated with a saved search
app.get('/api/saved-searches/:id/tags', async (req, res) => {
    try {
        const { id } = req.params;
        const tags = await db.query(
            `SELECT t.* FROM Tag t
             JOIN SavedSearch_Tag sst ON t.TagID = sst.TagID
             WHERE sst.SavedSearchID = ?`,
            [id]
        );
        res.json(tags);
    } catch (error) {
        console.error('Error fetching saved search tags:', error);
        res.status(500).json({ error: 'Failed to fetch saved search tags' });
    }
});

// POST create new saved search
app.post('/api/saved-searches', async (req, res) => {
    try {
        const { WorkspaceID, SearchName, ContentType } = req.body;
        if (!WorkspaceID || !SearchName) {
            return res.status(400).json({ error: 'WorkspaceID and SearchName are required' });
        }
        const result = await db.query(
            'INSERT INTO Saved_Search (WorkspaceID, SearchName, ContentType) VALUES (?, ?, ?)',
            [WorkspaceID, SearchName, ContentType || null]
        );
        res.status(201).json({
            SavedSearchID: result.insertId,
            WorkspaceID,
            SearchName,
            ContentType: ContentType || null,
        });
    } catch (error) {
        console.error('Error creating saved search:', error);
        res.status(500).json({ error: 'Failed to create saved search' });
    }
});

// DELETE a saved search
app.delete('/api/saved-searches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM Saved_Search WHERE SavedSearchID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Saved search not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting saved search:', error);
        res.status(500).json({ error: 'Failed to delete saved search' });
    }
});

// POST associate a tag with a saved search
app.post('/api/saved-searches/:savedSearchId/tags/:tagId', async (req, res) => {
    try {
        const { savedSearchId, tagId } = req.params;
        await db.query(
            'INSERT INTO SavedSearch_Tag (SavedSearchID, TagID) VALUES (?, ?)',
            [savedSearchId, tagId]
        );
        res.status(201).json({ SavedSearchID: savedSearchId, TagID: tagId });
    } catch (error) {
        console.error('Error associating tag with saved search:', error);
        res.status(500).json({ error: 'Failed to associate tag with saved search' });
    }
});

// graph view
// GET comprehensive graph data mapping for a workspace
app.get('/api/workspaces/:workspaceId/graph', async (req, res) => {
    try {
        const { workspaceId } = req.params;

        // FIXED: Removed the array destructuring brackets [ ] around the variables
        const contentRows = await db.query(
            'SELECT ContentID, WorkspaceID, Title FROM Content WHERE WorkspaceID = ?',
            [workspaceId]
        );

        const tagRows = await db.query(
            'SELECT TagID, WorkspaceID, TagName, HexColor FROM Tag WHERE WorkspaceID = ?',
            [workspaceId]
        );

        const edgeRows = await db.query(
            `SELECT ct.ContentID, ct.TagID 
             FROM Content_Tag ct
             JOIN Content c ON ct.ContentID = c.ContentID
             WHERE c.WorkspaceID = ?`,
            [workspaceId]
        );

        res.json({
            content: contentRows,
            tags: tagRows,
            contentTags: edgeRows
        });
    } catch (error) {
        console.error('Error compiling graph query rows:', error);
        res.status(500).json({ error: 'Failed to assemble relational graph data structure' });
    }
});

// snapshot routes
// GET all snapshots in a workspace

app.get('/api/workspaces/:workspaceId/snapshots', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const snapshots = await db.query(
            'SELECT * FROM Snapshot WHERE WorkspaceID = ? ORDER BY SnapshotTime DESC',
            [workspaceId]
        );
        res.json(snapshots);
    } catch (error) {
        console.error('Error fetching snapshots:', error);
        res.status(500).json({ error: 'Failed to fetch snapshots' });
    }
});

//this is error handling
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

//error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

//startup (initialize DB fully BEFORE accepting any requests)

const PORT = process.env.PORT|| 3000;

async function startServer() {
    try {
        console.log('Initializing database...');
        await db.initializeDatabase();
		
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`Mosaic server running on http://localhost:${PORT}`);
        });

    } catch (error) 
	{
        console.error('FATAL: Failed to initialize database. Server not started.');
        console.error(error);
        process.exit(1);
    }
}

startServer();

//graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await db.closePool();

    process.exit(0);
});