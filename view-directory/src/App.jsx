import './App.css';
import { FileList } from './components/FileList';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ActiveNodeProvider } from './contexts/ActiveNodeContext';

function App() {
  return (
    <ActiveNodeProvider>
      <div className="app-container">
        <h2>File Explorer</h2>
        <Breadcrumbs />
        <main aria-label="File Explorer">
          <div className="explorer-root" style={{ textAlign: 'left', minWidth: '300px' }}>
            <FileList parentId="root" />
          </div>
        </main>
      </div>
    </ActiveNodeProvider>
  )
}

export default App
