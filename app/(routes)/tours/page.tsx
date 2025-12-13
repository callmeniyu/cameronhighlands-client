"use client";

import { useEffect, useState } from "react";
import FilterSidebar from "@/components/ui/TourFilterBar";
import SearchInput from "@/components/ui/SearchInput";
import TourCard from "@/components/ui/TourCard";
import Lottie from "lottie-react";
import NotFound from "@/public/images/notfound.json";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { tourApi } from "@/lib/tourApi";
import { TourType } from "@/lib/types";
import Loader from "@/components/ui/Loader";
import Image from "next/image";

type FilterState = {
  type: string;
  prices: string[];
  durations: string[];
};

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allTours, setAllTours] = useState<TourType[]>([]);
  const [filteredTours, setFilteredTours] = useState<TourType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    prices: [],
    durations: [],
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showFilterTip, setShowFilterTip] = useState(false);

  // Sort helper: labeled items (has label) come first, then ascending by newPrice
  const sortByLabelAndPrice = <
    T extends { label?: string | null; newPrice?: number }
  >(
    items: T[]
  ) => {
    return [...items].sort((a, b) => {
      const aHas = !!a.label;
      const bHas = !!b.label;
      if (aHas !== bHas) return aHas ? -1 : 1; // labeled first
      return (a.newPrice || 0) - (b.newPrice || 0);
    });
  };

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tourApi.getTours({ limit: 100 }); // Get all tours
        console.log("API Response:", response.data);
        console.log("First tour image:", response.data[0]?.image);
        const sorted = sortByLabelAndPrice(response.data);
        setAllTours(sorted);
        setFilteredTours(sorted);
      } catch (err) {
        console.error("Error fetching tours:", err);
        setError("Failed to load tours. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Apply filters and search in real-time
  useEffect(() => {
    // Only apply search in real-time, not filters
    if (allTours.length === 0) return;

    const applySearch = () => {
      console.log("Applying search:", {
        searchTerm,
        tourCount: allTours.length,
      });

      const result = allTours.filter((tour: TourType) => {
        const matchSearch =
          searchTerm.trim() === "" ||
          tour.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          tour.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim()) ||
          tour.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase().trim())
          );

        return matchSearch;
      });

      setFilteredTours(sortByLabelAndPrice(result));
      console.log(
        "Search results:",
        result.length,
        "tours match the search criteria"
      );

      // Check if search is active
      const hasActiveSearch = searchTerm.trim() !== "";
      setFiltersApplied(
        hasActiveSearch ||
          filters.type !== "All" ||
          filters.prices.length > 0 ||
          filters.durations.length > 0
      );
    };

    applySearch();
  }, [allTours, searchTerm]);

  const handleApply = () => {
    console.log("Applying filters:", {
      searchTerm,
      filters,
      tourCount: allTours.length,
    });

    const result = allTours.filter((tour: TourType) => {
      const { type, prices, durations } = filters;

      const matchType =
        type === "All" ||
        tour.type.toLowerCase() === type.toLowerCase() ||
        tour.packageType.toLowerCase() === type.toLowerCase() ||
        tour.tags.some(
          (tag: string) => tag.toLowerCase() === type.toLowerCase()
        );

      const matchPrice =
        prices.length === 0 ||
        prices.some((range) => {
          const [min, max] = range.split("-").map(Number);
          if (isNaN(min) || isNaN(max)) return false;
          return tour.newPrice >= min && tour.newPrice <= max;
        });

      const matchDuration =
        durations.length === 0 ||
        durations.some((dur) => {
          // Check both the period field and tags for duration matching
          const periodMatch =
            tour.period &&
            tour.period.toLowerCase().includes(dur.toLowerCase());
          const tagMatch = tour.tags.some((tag: string) =>
            tag.toLowerCase().includes(dur.toLowerCase())
          );
          return periodMatch || tagMatch;
        });

      const matchSearch =
        searchTerm.trim() === "" ||
        tour.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        tour.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        tour.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );

      return matchType && matchPrice && matchDuration && matchSearch;
    });

    setFilteredTours(sortByLabelAndPrice(result));
    console.log("Filtered results:", result.length, "tours match the criteria");

    // Check if any filters/search are actually active
    const hasActiveFilters =
      searchTerm.trim() !== "" ||
      filters.type !== "All" ||
      filters.prices.length > 0 ||
      filters.durations.length > 0;

    setFiltersApplied(hasActiveFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      type: "All",
      prices: [],
      durations: [],
    });
    setSearchTerm("");
    setFilteredTours(sortByLabelAndPrice(allTours));
    setFiltersApplied(false);
    setIsFilterOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredTours(sortByLabelAndPrice(allTours));
    setFiltersApplied(false);
  };

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "unset";
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [isFilterOpen]);

  // show the mobile filter tip once unless dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("filterTipDismissed") === "true";
      setShowFilterTip(!dismissed);
    } catch (e) {
      setShowFilterTip(true);
    }
  }, []);

  const dismissFilterTip = () => {
    try {
      localStorage.setItem("filterTipDismissed", "true");
    } catch (e) {}
    setShowFilterTip(false);
  };

  // auto-hide tip after 30 seconds when visible
  useEffect(() => {
    if (!showFilterTip || isFilterOpen) return;
    const id = window.setTimeout(() => {
      dismissFilterTip();
    }, 100000);
    return () => window.clearTimeout(id);
  }, [showFilterTip, isFilterOpen]);

  return (
    <div>
      <div className="relative h-72 sm:h-96 md:h-[90vh] pt-16 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/tour_main.png"
          alt="Van transfers background"
          fill
          className="object-cover mt-12"
          priority
        />
        {/* Light black overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold sm:font-bold font-poppins">
            Find Your Perfect Tour
          </h1>
          <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base md:text-lg font-poppins">
            From scenic Land Rover rides to intimate group adventures, discover
            the best of Cameron Highlands through our curated tour packages.
          </p>
        </div>
        <div className="sm:flex hidden  justify-center absolute bottom-8 left-0 right-0 z-20">
          <div className="animate-bounce w-8 h-14 rounded-full border-2 border-white/50 flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 items-center justify-between px-4 sm:px-5 mt-6 sm:mt-8">
        <hr className="border-b-2 border-primary_green  w-full hidden md:flex" />
        <SearchInput
          customeStyles=""
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleApply}
          onClear={handleClearSearch}
        />

        {/* Mobile/Desktop filter button */}
        <div className="sm:hidden flex gap-2 relative flex-shrink-0">
          <button
            className="flex items-center gap-1 text-sm bg-primary_green text-white px-3 py-2 rounded-md hover:bg-primary_green/80 transition-colors"
            onClick={() =>
              filtersApplied ? handleClearFilters() : setIsFilterOpen(true)
            }
          >
            {filtersApplied ? <IoClose /> : <IoFilterSharp />}{" "}
            {filtersApplied ? "Clear" : "Filters"}
          </button>

          {/* Mobile-only tip dialog pointing to the Filters button */}
          {showFilterTip && !isFilterOpen && (
            <div className="absolute right-1 -top-20 z-50 sm:hidden">
              <div className="relative">
                <div className="bg-primary_green text-white p-3 rounded-lg shadow-xl w-64 transform transition duration-300 ease-out translate-y-2 opacity-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm">
                      Tip: Use Filters to narrow results
                    </div>
                    <button
                      onClick={dismissFilterTip}
                      aria-label="Close tip"
                      className="ml-2 text-white/90 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-white/90">
                    Tap the Filters button below.
                  </div>
                </div>
                {/* small downward arrow */}
                <div className="absolute right-2 transform -translate-x-1/2 -bottom-2 w-3 h-3 rotate-45 bg-primary_green shadow-xl" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 flex flex-col sm:flex-row gap-4 relative">
        <div className="hidden sm:block sticky-filter">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={handleApply}
            onClear={handleClearFilters}
          />
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4 sm:hidden">
            <div className="bg-white rounded-lg w-full max-w-sm p-4 relative animate-fadeInUp shadow-lg max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black z-10"
              >
                <IoClose size={24} />
              </button>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                isSmallScreen={true}
                onApply={() => {
                  handleApply();
                  setIsFilterOpen(false);
                }}
                onClear={() => {
                  handleClearFilters();
                  setIsFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 mt-4">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-primary_green text-white rounded-md hover:bg-primary_green/80"
              >
                Retry
              </button>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="col-span-full text-center text-desc_gray mt-4 text-sm">
              <Lottie
                loop
                animationData={NotFound}
                className="w-40 h-40 mx-auto"
              />
              <p>No tours match your filters. Try changing the options.</p>
            </div>
          ) : (
            filteredTours.map((tour: TourType, i: number) => (
              <TourCard key={tour._id || tour.slug || i} {...tour} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
