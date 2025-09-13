import React from 'react';
import { Filter, X, Loader2 } from 'lucide-react';

const FiltersSidebar = ({ filters, filterOptions, onFilterChange, onClearFilters, loading }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value.toString().trim()).length;

  const SelectField = ({ label, value, options, onChange, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-blue-400 mb-4 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating filters...
        </div>
      )}

      <div className="space-y-1">
        <SelectField
          label="End Year"
          value={filters.end_year}
          options={Array.from({ length: 20 }, (_, i) => (2020 + i).toString())}
          onChange={(value) => handleFilterChange('end_year', value)}
          placeholder="Select year"
        />

        <SelectField
          label="Topic"
          value={filters.topic}
          options={filterOptions.topics}
          onChange={(value) => handleFilterChange('topic', value)}
          placeholder="All topics"
        />

        <SelectField
          label="Sector"
          value={filters.sector}
          options={filterOptions.sectors}
          onChange={(value) => handleFilterChange('sector', value)}
          placeholder="All sectors"
        />

        <SelectField
          label="Region"
          value={filters.region}
          options={filterOptions.regions}
          onChange={(value) => handleFilterChange('region', value)}
          placeholder="All regions"
        />

        <SelectField
          label="PESTLE"
          value={filters.pestle}
          options={filterOptions.pestles}
          onChange={(value) => handleFilterChange('pestle', value)}
          placeholder="All PESTLE factors"
        />

        <SelectField
          label="Source"
          value={filters.source}
          options={filterOptions.sources}
          onChange={(value) => handleFilterChange('source', value)}
          placeholder="All sources"
        />

        <SelectField
          label="Country"
          value={filters.country}
          options={filterOptions.countries}
          onChange={(value) => handleFilterChange('country', value)}
          placeholder="All countries"
        />
      </div>

      {/* Filter Summary */}
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Active Filters</h3>
        {activeFiltersCount === 0 ? (
          <p className="text-xs text-gray-400">No filters applied - showing all data</p>
        ) : (
          <div className="space-y-1">
            {Object.entries(filters).map(([key, value]) => 
              value && value.toString().trim() ? (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-white font-medium truncate ml-2" title={value}>
                    {value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  </span>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersSidebar;