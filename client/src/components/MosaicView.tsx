import { useState } from "react";
import {
  FaFilePdf,
  FaImage,
  FaMarkdown,
  FaPlay,
  FaVideo,
} from "react-icons/fa";
import { content } from "../data/mockData";
import TesseraDetail from "./TesseraDetail";

function getTileClass(contentType: string) {
  if (contentType === "Video") return "mosaic-tile mosaic-video";
  if (contentType === "Markdown") return "mosaic-tile mosaic-note";
  if (contentType === "PDF") return "mosaic-tile mosaic-pdf";
  if (contentType === "Image") return "mosaic-tile mosaic-image";
  if (contentType === "Audio") return "mosaic-tile mosaic-audio";

  return "mosaic-tile";
}

function getPreviewText(item: (typeof content)[number]) {
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
  const [selectedTessera, setSelectedTessera] = useState<
    (typeof content)[number] | null
  >(null);

  return (
    <>
      <div className="mosaic-board">
        {content.map((item) => (
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