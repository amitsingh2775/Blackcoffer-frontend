import React, { useState, useEffect } from 'react';
import { fetchData, fetchFilters, fetchStats } from '../utils/api';
import FiltersSidebar from './FiltersSidebar';
import IntensityBarChart from './charts/IntensityBarChart';
import LikelihoodBubbleChart from './charts/LikelihoodBubbleChart';
import RegionWorldMap from './charts/RegionWorldMap';
import TopicsDonutChart from './charts/TopicsDonutChart';
import { BarChart3, TrendingUp, Globe, PieChart, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    end_year: '',
    topic: '',
    sector: '',
    region: '',
    pestle: '',
    source: '',
    country: ''
  });
  
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await fetchFilters();
        setFilterOptions(response.filters || {});
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options');
      }
    };
    
    loadFilterOptions();
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchStats();
        setStats(response.stats || {});
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    
    loadStats();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchData(filters);
        setData(response.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      end_year: '',
      topic: '',
      sector: '',
      region: '',
      pestle: '',
      source: '',
      country: ''
    });
  };

  if (error && !data.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Blackcoffer 
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-blue-400 font-semibold">{data.length}</span> insights loaded
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <FiltersSidebar
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-blue-100">Total Insights</h3>
              <p className="text-2xl font-bold text-white">{stats.totalInsights?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-green-100">Avg Intensity</h3>
              <p className="text-2xl font-bold text-white">{stats.avgIntensity?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-purple-100">Avg Relevance</h3>
              <p className="text-2xl font-bold text-white">{stats.avgRelevance?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-orange-100">Avg Likelihood</h3>
              <p className="text-2xl font-bold text-white">{stats.avgLikelihood?.toFixed(1) || '0.0'}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Intensity Bar Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Average Intensity by Sector</h2>
              </div>
              <IntensityBarChart data={data} loading={loading} />
            </div>

            {/* Topics Donut Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold">Top Topics Distribution</h2>
              </div>
              <TopicsDonutChart data={data} loading={loading} />
            </div>

            {/* Likelihood Bubble Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold">Relevance vs Likelihood</h2>
              </div>
              <LikelihoodBubbleChart data={data} loading={loading} />
            </div>

            {/* World Map */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold">Global Distribution</h2>
              </div>
              <RegionWorldMap data={data} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;