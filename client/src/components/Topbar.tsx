type TopbarProps = {
  onToggleFiles: () => void;
};

function Topbar({ onToggleFiles }: TopbarProps) {
  return (
    <header className="topbar">
      <h1 className="logo">Mosaic</h1>

      <div className="top-actions">
        <select>
          <option>Personal</option>
          <option>Work</option>
          <option>School</option>
        </select>

        <button>Graph View</button>
        <button>Mosaic View</button>
        <button onClick={onToggleFiles}>Files</button>
      </div>
    </header>
  );
}

export default Topbar;