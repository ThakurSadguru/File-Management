import { Filter } from 'lucide-react'
import { FILE_TYPE_FILTERS } from '../../utils/fileType'

export default function FilterBar({ value, onChange }) {
  return (
    <label className="filter">
      <Filter size={16} />
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Filter by file type">
        {FILE_TYPE_FILTERS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  )
}

