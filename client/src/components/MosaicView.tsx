import { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaImage,
  FaMarkdown,
  FaPlay,
  FaVideo,
} from "react-icons/fa";
import { useWorkspace } from "../context/WorkspaceContext";
import { getWorkspaceContent, type Content } from "../api/client"; // Clean centralized imports!
import TesseraDetail from "./TesseraDetail";

function getTileClass(contentType: string) {
  if (contentType === "Video") return "mosaic-tile mosaic-video";
  if (contentType === "Markdown") return "mosaic-tile mosaic-note";
  if (contentType === "PDF") return "mosaic-tile mosaic-pdf";
  if (contentType === "Image") return "mosaic-tile mosaic-image";
  if (contentType === "Audio") return "mosaic-tile mosaic-audio";

  return "mosaic-tile";
}

function getPreviewText(item: Content) {
  return item.TextContent || item.Description || "No preview available";
}

function getPreviewIcon(contentType: string) {
  if (contentType === "PDF") return <FaFilePdf />;
  if (contentType === "Image") return <FaImage />;
  if (contentType === "Audio") return <FaPlay />;
  if (contentType === "Video") return <FaVideo />;
  if (contentType === "Markdown") return <FaMarkdown />;

  return null;
}

function MosaicView() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.WorkspaceID || 1;

  const [contentList, setContentList] = useState<Content[]>([]);
  const [selectedTessera, setSelectedTessera] = useState<Content | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMosaicContent() {
      try {
        setLoading(true);
        setError(null);

        // Using your central API layer helper method!
        const data = await getWorkspaceContent(workspaceId);
        setContentList(data);
      } catch (err) {
        console.error("Error reading project mosaic database stream:", err);
        setError("Unable to interface with dynamic workspace material matrix.");
      } finally {
        setLoading(false);
      }
    }

    fetchMosaicContent();
  }, [workspaceId]);

  if (loading) return <div style={{ padding: "20px", color: "var(--text)" }}>Arranging your digital mosaic grid...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  if (contentList.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text)" }}>
        <h3>Your Mosaic is completely clear!</h3>
        <p>Click "+ Add Tessera" below to save your first piece of inspiration.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mosaic-board">
        {contentList.map((item) => (
          <button
            className={getTileClass(item.ContentType)}
            key={item.ContentID}
            onClick={() => setSelectedTessera(item)}
          >
            <div className="mosaic-preview">
              {item.ContentType === "Markdown" ? (
                <span>{getPreviewText(item)}</span>
              ) : (
                <span className="mosaic-preview-icon">
                  {getPreviewIcon(item.ContentType)}
                </span>
              )}
            </div>

            <div className="mosaic-tile-footer">
              <span className="mosaic-type">{item.ContentType}</span>
              <h3>{item.Title}</h3>
            </div>
          </button>
        ))}
      </div>

      {selectedTessera && (
        <TesseraDetail
          tessera={selectedTessera}
          onClose={() => setSelectedTessera(null)}
          onRemoveFromCollection={() => {}}
        />
      )}
    </>
  );
}

export default MosaicView;