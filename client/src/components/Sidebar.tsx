type SidebarProps = {
  isOpen: boolean;
};

const files = [
  "Homework Notes.md",
  "Lecture Slides.pdf",
  "Meeting Notes.md",
  "Research Ideas.md",
  "Project Plan.docx",
];

function Sidebar({ isOpen }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      <div className="folder open">▾ Workspace</div>

      <div className="file-list">
        {files.map((file) => (
          <p key={file}>{file}</p>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;