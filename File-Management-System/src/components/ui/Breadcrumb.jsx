import { ChevronRight, Home } from 'lucide-react'
import { useFileContext } from '../../context/useFileContext'

export default function Breadcrumb() {
  const { breadcrumbFolders, openFolder } = useFileContext()

  return (
    <div className="breadcrumb" aria-label="Breadcrumb">
      <button className="crumb" onClick={() => openFolder('root')} type="button" title="My Files">
        <Home size={16} />
      </button>
      {breadcrumbFolders
        .filter((f) => f.id !== 'root')
        .map((f) => (
          <div key={f.id} className="crumb-node">
            <ChevronRight size={14} className="crumb-sep" />
            <button className="crumb" onClick={() => openFolder(f.id)} type="button">
              {f.name}
            </button>
          </div>
        ))}
    </div>
  )
}

