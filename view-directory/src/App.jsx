import './App.css'
import { FileList } from './components/FileList'

function App() {
  return (
    <div className="app-container">
      <h2>File Explorer</h2>
      <main aria-label="File Explorer">
        <div className="explorer-root" style={{ textAlign: 'left', minWidth: '300px' }}>
          <FileList parentId="root" />
        </div>
      </main>
    </div>
  )
}

export default App
