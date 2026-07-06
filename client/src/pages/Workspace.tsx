function Workspace() {
  return (
    <main className="workspace">
      <div className="search-box">
        <input placeholder="Search tags or content..." />
        <span className="divider"></span>
        <button className="star-button">☆</button>
        <button className="saved-button">Saved Searches</button>
      </div>

      <section className="workspace-title">
        <p>Mosaic of Tesserae</p>
      </section>

      <button className="add-button">＋ Add Tessera</button>
    </main>
  );
}

export default Workspace;