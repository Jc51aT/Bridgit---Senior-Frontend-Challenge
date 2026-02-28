import './App.css'
import { FileSystemProvider, useFileSystem } from './context/FileSystemContext'
import { FileList } from './components/FileList'

function ExplorerRoot() {
  const { state, loading, error } = useFileSystem();

  if (loading) return <div style={{ padding: '20px' }}>Loading files...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}. Make sure json-server is running!</div>;

  return (
    <div className="explorer-root" style={{ textAlign: 'left', minWidth: '300px' }}>
      <FileList nodeIds={state.rootIds} />
    </div>
  );
}

function App() {
  return (
    <FileSystemProvider>
      <div className="app-container">
        <h2>File Explorer</h2>
        <main aria-label="File Explorer">
          <ExplorerRoot />
        </main>
      </div>
    </FileSystemProvider>
  )
}

export default App
