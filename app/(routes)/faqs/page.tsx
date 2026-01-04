"use client";
import { useState, useEffect } from "react";
import { FAQType } from "@/lib/types";
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from "react-icons/fi";

// FAQ Data
const allFaqs: FAQType[] = [
  // Tours FAQ
  {
    id: 1,
    question: "What types of tours does Cameron Highlands Tours offer?",
    answer:
      "Cameron Highlands Tours offers carefully curated, small-group day tours across the Cameron Highlands. We specialize in tea plantation visits, strawberry farm tours, nature trails, and cultural experiences designed for travelers who value calm, well-paced itineraries.",
    category: "Tours",
  },
  {
    id: 2,
    question: "Are the tours suitable for families with children?",
    answer:
      "Yes. Our tours are family-friendly and suitable for all ages. We maintain a relaxed pace with plenty of photo stops and breaks. Children under 12 typically receive discounted rates.",
    category: "Tours",
  },
  {
    id: 3,
    question: "What is included in the tour package?",
    answer:
      "All tours include hotel pick-up and drop-off, air-conditioned transportation, an experienced English-speaking guide, and entrance fees to attractions. Meals are not included unless specifically stated in the tour description.",
    category: "Tours",
  },
  {
    id: 4,
    question: "How many people are in a typical tour group?",
    answer:
      "We keep our groups small, typically between 4-8 people, to ensure a personalized experience. Private tours are also available for those who prefer exclusivity.",
    category: "Tours",
  },
  {
    id: 5,
    question: "What should I bring on a tour?",
    answer:
      "We recommend bringing comfortable walking shoes, a light jacket (temperatures can be cool), sunscreen, a hat, and your camera. An umbrella or raincoat is also advisable as weather can be unpredictable.",
    category: "Tours",
  },
  {
    id: 6,
    question: "What are the tour pick-up and drop-off times?",
    answer:
      "Most tours start between 8:00 and 8:15 AM. Please wait at the main entrance or the security gate of the property for pickup. Drop off time depends on traffic: •	Half day tour, around 4 hours • Full day tour, around 7 hours",
    category: "Tours",
  },
  {
    id: 7,
    question: "Can I customize my tour itinerary?",
    answer:
      "Yes. For private tours, we're happy to adjust the itinerary based on your interests. Please contact us at cameronhighlandstours.com@gmail.com to discuss your preferences.",
    category: "Tours",
  },
  {
    id: 8,
    question: "What is your cancellation policy?",
    answer:
      "Cancellations made 48 hours or more before the tour start time receive a full refund. Cancellations within 48 hours are non-refundable, though we may offer rescheduling options based on availability.",
    category: "Tours",
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQType[]>(allFaqs);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = [...new Set(allFaqs.map((faq) => faq.category))];

  // Filter FAQs based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFaqs(allFaqs);
    } else {
      const results = allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(results);
    }
  }, [searchTerm]);

  const handleApply = () => {
    // Already handled in useEffect
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  return (
    <div className="min-h-screen bg-white font-poppins pt-16">
      {/* Hero Section */}
      <div className="relative h-64 bg-primary flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl font-bold text-white mb-4">FAQs</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Find answers to common questions about Cameron Highlands Tours
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <SearchInput
            customeStyles="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleApply}
            onClear={handleClearSearch}
          />
          {searchTerm && (
            <p className="mt-2 text-desc_gray">
              Showing {filteredFaqs.length} result
              {filteredFaqs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryFaqs = filteredFaqs.filter(
              (faq) => faq.category === category
            );
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="border-b border-gray-100 pb-8">
                <button
                  onClick={() => toggleCategory(category ?? "")}
                  className="flex items-center justify-between w-full mb-6 transition-colors duration-200 hover:text-primary_green/80"
                >
                  <h2 className="text-2xl font-bold text-primary_green">
                    {category}
                  </h2>
                  <div className="transition-transform duration-200">
                    {activeCategory === category ? (
                      <FiChevronUp className="text-primary_green text-xl" />
                    ) : (
                      <FiChevronDown className="text-primary_green text-xl" />
                    )}
                  </div>
                </button>

                <div
                  className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeCategory !== null && activeCategory !== category
                      ? "max-h-0 opacity-0"
                      : "max-h-[2000px] opacity-100"
                  }`}
                >
                  {categoryFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <h3 className="font-medium text-title_black">
                          {faq.question}
                        </h3>
                        <div className="transition-transform duration-200">
                          {activeAccordion === index ? (
                            <FiChevronUp className="text-primary_green" />
                          ) : (
                            <FiChevronDown className="text-primary_green" />
                          )}
                        </div>
                      </button>
                      <div
                        className={`bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                          activeAccordion === index
                            ? "max-h-96 opacity-100 border-t border-gray-200"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4">
                          <p className="text-desc_gray">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-title_black mb-2">
              No results found
            </h3>
            <p className="text-desc_gray">
              Try a different search term or browse our categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Search Input Component
function SearchInput({
  customeStyles,
  value,
  onChange,
  onSearch,
  onClear,
}: {
  customeStyles: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onClear: () => void;
}) {
  return (
    <div className={`relative ${customeStyles}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search FAQs..."
        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary_green focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <FiX className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}
