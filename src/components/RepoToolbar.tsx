import React from 'react'
import { Search, X, Filter, ChevronDown, Check, ArrowUpDown } from 'lucide-react'
import { type FilterOption, type SortOption } from '../hooks/useRepositories'

interface RepoToolbarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  filterBy: FilterOption
  setFilterBy: (f: FilterOption) => void
  showSortMenu: boolean
  setShowSortMenu: (s: boolean) => void
  showFilterMenu: boolean
  setShowFilterMenu: (f: boolean) => void
}

export const RepoToolbar: React.FC<RepoToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  showSortMenu,
  setShowSortMenu,
  showFilterMenu,
  setShowFilterMenu,
}) => {
  return (
    <div className="repo-toolbar">
      <div className="repo-search-wrap">
        <Search size={14} className="repo-search-icon" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="repo-search-input"
        />
        {searchQuery && (
          <button
            className="repo-search-clear"
            onClick={() => setSearchQuery('')}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="repo-toolbar-actions">
        {/* Filter dropdown */}
        <div className="repo-dropdown-wrap">
          <button
            className="repo-toolbar-btn"
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false) }}
          >
            <Filter size={13} />
            {filterBy === 'all' ? 'All' : filterBy === 'public' ? 'Public' : 'Private'}
            <ChevronDown size={12} />
          </button>
          {showFilterMenu && (
            <div className="repo-dropdown-menu" onMouseLeave={() => setShowFilterMenu(false)}>
              {(['all', 'public', 'private'] as FilterOption[]).map((opt) => (
                <button
                  key={opt}
                  className={`repo-dropdown-item ${filterBy === opt ? 'active' : ''}`}
                  onClick={() => { setFilterBy(opt); setShowFilterMenu(false) }}
                >
                  {opt === 'all' ? 'All repos' : opt === 'public' ? 'Public only' : 'Private only'}
                  {filterBy === opt && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="repo-dropdown-wrap">
          <button
            className="repo-toolbar-btn"
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false) }}
          >
            <ArrowUpDown size={13} />
            {sortBy === 'updated' ? 'Recently updated' : sortBy === 'name' ? 'Name' : 'Stars'}
            <ChevronDown size={12} />
          </button>
          {showSortMenu && (
            <div className="repo-dropdown-menu" onMouseLeave={() => setShowSortMenu(false)}>
              {([
                { key: 'updated', label: 'Recently updated' },
                { key: 'name', label: 'Name' },
                { key: 'stars', label: 'Most stars' },
              ] as { key: SortOption; label: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  className={`repo-dropdown-item ${sortBy === opt.key ? 'active' : ''}`}
                  onClick={() => { setSortBy(opt.key); setShowSortMenu(false) }}
                >
                  {opt.label}
                  {sortBy === opt.key && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
