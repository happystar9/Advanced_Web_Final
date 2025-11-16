import Filter from './Filter'
import SearchInput from './SearchInput'
import type { SortMode, HoursFilter } from '../hooks/useFilteredGames'

type Props = {
  sortMode: SortMode
  onSortChange: (m: SortMode) => void
  hoursFilter: HoursFilter
  onHoursChange: (h: HoursFilter) => void
  search: string
  onSearch: (s: string) => void
  count: { shown: number; total: number }
}

export default function FiltersBar({ sortMode, onSortChange, hoursFilter, onHoursChange, search, onSearch, count }: Props) {
  return (
    <div className="col-span-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
      <Filter
        label="Sort:"
        variant="select"
        options={[
          { key: 'hours-desc', label: 'Hours (desc)' },
          { key: 'hours-asc', label: 'Hours (asc)' },
          { key: 'alpha', label: 'A → Z' },
          { key: 'alpha-desc', label: 'Z → A' },
        ]}
        value={sortMode}
        onChange={(k) => onSortChange(k as SortMode)}
      />

      <Filter
        label="Hours:"
        variant="buttons"
        options={[
          { key: 'all', label: 'All' },
          { key: 'gt100', label: '>100h' },
          { key: 'gt10', label: '>10h' },
          { key: 'lt10', label: '<10h' },
        ]}
        value={hoursFilter}
        onChange={(k) => onHoursChange(k as HoursFilter)}
      />

      <div className="flex gap-4 items-center w-full sm:w-auto">
        <SearchInput value={search} onChange={onSearch} placeholder="Search games..." />
      </div>

      <div className="text-sm text-gray-400">Showing {count.shown} of {count.total} games</div>
    </div>
  )
}