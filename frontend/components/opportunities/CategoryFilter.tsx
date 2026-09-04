"use client";

const categories = [
  "all",
  "hackathon",
  "certification",
  "job",
  "course",
  "deal",
  "other",
];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeCategory === category
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {category === "all"
            ? "All"
            : category.charAt(0).toUpperCase() +
              category.slice(1)}
        </button>
      ))}
    </div>
  );
}