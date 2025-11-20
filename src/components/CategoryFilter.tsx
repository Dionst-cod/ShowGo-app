interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-12">
      <button
        onClick={() => onSelectCategory(null)}
        className={`group relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
          selectedCategory === null
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] scale-105'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white border border-gray-700/50 backdrop-blur-sm hover:scale-105 hover:border-purple-500/30'
        }`}
      >
        <span className="relative z-10">All Events</span>
        {selectedCategory === null && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl"></div>
        )}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`group relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
            selectedCategory === category
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] scale-105'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white border border-gray-700/50 backdrop-blur-sm hover:scale-105 hover:border-purple-500/30'
          }`}
        >
          <span className="relative z-10">{category}</span>
          {selectedCategory === category && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur-xl"></div>
          )}
        </button>
      ))}
    </div>
  );
}
