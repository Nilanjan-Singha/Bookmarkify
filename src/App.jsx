import React, { useState, useEffect, useRef } from 'react';
import { Star, Plus, Search, Download, Upload, Edit2, Trash2, Link, Settings, X, Grid, List, ExternalLink, Moon, Sun } from 'lucide-react';

const BookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState(['Movie', 'Anime', 'Manga', 'Educational', 'Directory', 'AI Tools', 'Dev Tools', 'Unlisted']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    category: 'General',
    tags: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);


  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    const savedCategories = localStorage.getItem('categories');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const addBookmark = () => {
    if (newBookmark.title && newBookmark.url) {
      const bookmark = {
        id: Date.now(),
        ...newBookmark,
        tags: newBookmark.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        favorite: false,
        createdAt: new Date().toISOString(),
        favicon: getFaviconUrl(newBookmark.url)
      };
      setBookmarks([...bookmarks, bookmark]);
      setNewBookmark({ title: '', url: '', category: 'General', tags: '', description: '' });
      setShowAddForm(false);
    }
  };

  const updateBookmark = () => {
    if (editingBookmark.title && editingBookmark.url) {
      setBookmarks(bookmarks.map(bookmark =>
        bookmark.id === editingBookmark.id
          ? { ...editingBookmark, tags: editingBookmark.tags.split(',').map(tag => tag.trim()).filter(tag => tag) }
          : bookmark
      ));
      setEditingBookmark(null);
    }
  };

  const deleteBookmark = (id) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const toggleFavorite = (id) => {
    setBookmarks(bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, favorite: !bookmark.favorite } : bookmark
    ));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  // Filtering
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory;
    const matchesFavorites = !showFavorites || bookmark.favorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Import/Export
  const exportBookmarks = () => {
    const dataStr = JSON.stringify({ bookmarks, categories }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `bookmarks_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBookmarks = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.bookmarks && data.categories) {
            setBookmarks(data.bookmarks);
            setCategories(data.categories);
          }
        } catch (error) {
          alert('Error importing bookmarks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Helper for conditional classes
  const mode = darkMode ? 'dark' : 'light';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link className="h-8 w-8" />
                <h1 className="text-xl font-semibold">Bookmarkify</h1>
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Bookmark</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                : 'border-gray-300 bg-white text-black focus:ring-black'
              }`}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
              ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
              : 'border-gray-300 bg-white text-black focus:ring-black'
            }`}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
              showFavorites
                ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                : (darkMode
                  ? 'border border-gray-700 hover:bg-gray-800'
                  : 'border border-gray-300 hover:bg-gray-50')
            }`}
          >
            <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Bookmarks Grid/List */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {filteredBookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              className={`group border rounded-lg p-4 hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex items-center space-x-4' : ''} ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
            >
              <div className={`flex items-start space-x-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                {bookmark.favicon && (
                  <img
                    src={bookmark.favicon}
                    alt=""
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className={`font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{bookmark.title}</h3>
                    <button
                      onClick={() => toggleFavorite(bookmark.id)}
                      className={`ml-2 p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Star className={`h-4 w-4 ${bookmark.favorite ? 'fill-current text-yellow-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`} />
                    </button>
                  </div>
                  <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{bookmark.url}</p>
                  {bookmark.description && (
                    <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{bookmark.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{bookmark.category}</span>
                      {bookmark.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {bookmark.tags.slice(0, 2).map(tag => (
                            <span key={tag} className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                              {tag}
                            </span>
                          ))}
                          {bookmark.tags.length > 2 && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>+{bookmark.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-2 ${viewMode === 'list' ? '' : 'mt-3'}`}>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setEditingBookmark({ ...bookmark, tags: bookmark.tags.join(', ') })}
                  className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className={`p-2 rounded transition-colors text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No bookmarks found</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || showFavorites || selectedCategory !== 'All'
                ? 'Try adjusting your filters or search term'
                : 'Start by adding your first bookmark'
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-4 py-2 rounded-md transition-colors ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              Add Bookmark
            </button>
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Bookmark</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Title</label>
                <input
                  type="text"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                  placeholder="Enter bookmark title"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>URL</label>
                <input
                  type="url"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Category</label>
                <select
                  value={newBookmark.category}
                  onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={newBookmark.tags}
                  onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                  placeholder="work, important, reference"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addBookmark}
                className={`flex-1 py-2 rounded-md transition-colors ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                Add Bookmark
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`flex-1 border py-2 rounded-md transition-colors ${darkMode
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bookmark Modal */}
      {editingBookmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Bookmark</h2>
              <button
                onClick={() => setEditingBookmark(null)}
                className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Title</label>
                <input
                  type="text"
                  value={editingBookmark.title}
                  onChange={(e) => setEditingBookmark({ ...editingBookmark, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>URL</label>
                <input
                  type="url"
                  value={editingBookmark.url}
                  onChange={(e) => setEditingBookmark({ ...editingBookmark, url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Category</label>
                <select
                  value={editingBookmark.category}
                  onChange={(e) => setEditingBookmark({ ...editingBookmark, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingBookmark.tags}
                  onChange={(e) => setEditingBookmark({ ...editingBookmark, tags: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={editingBookmark.description}
                  onChange={(e) => setEditingBookmark({ ...editingBookmark, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                    ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                    : 'border-gray-300 bg-white text-black focus:ring-black'
                  }`}
                  rows="3"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateBookmark}
                className={`flex-1 py-2 rounded-md transition-colors ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                Update Bookmark
              </button>
              <button
                onClick={() => setEditingBookmark(null)}
                className={`flex-1 border py-2 rounded-md transition-colors ${darkMode
                  ? 'border-gray-700 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Import/Export</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={exportBookmarks}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 border rounded-md transition-colors ${darkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 border rounded-md transition-colors ${darkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importBookmarks}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Manage Categories</h3>
                <div className={`max-h-32 overflow-y-auto border rounded-md p-2 mb-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <div key={category} className={`flex items-center rounded-full px-3 py-1 text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className="mr-2">{category}</span>
                        {category !== 'General' && (
                          <button
                            onClick={() => setCategories(categories.filter(c => c !== category))}
                            className={`text-red-600 rounded-full p-0.5 ml-1 ${darkMode ? 'hover:bg-red-900' : 'hover:bg-red-200'}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className={`flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
                      ? 'border-gray-700 bg-gray-900 text-gray-100 focus:ring-white'
                      : 'border-gray-300 bg-white text-black focus:ring-black'
                    }`}
                  />
                  <button
                    onClick={addCategory}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Statistics</h3>
                <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>Total bookmarks: {bookmarks.length}</p>
                  <p>Favorite bookmarks: {bookmarks.filter(b => b.favorite).length}</p>
                  <p>Categories: {categories.length}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className={`w-full py-2 rounded-md transition-colors ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkManager;