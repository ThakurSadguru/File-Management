import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search by name…' }) {
  return (
    <label className="search">
      <Search size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search files"
      />
    </label>
  )
}

