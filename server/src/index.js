const express=require('express');
const cors=require('cors');
const db=require('../database/db');

const app=express();

// Middleware
app.use(cors());
app.use(express.json());

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
            'INSERT INTO Content_Tag (ContentID, TagID) VALUES (?, ?)',
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
    } catch (error) 
	{
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ error: 'Failed to fetch saved searches' });
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
		
        console.log('✓ Database initialized successfully');

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