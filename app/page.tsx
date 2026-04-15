"use client";

import Link from "next/link";
import Image from "next/image";
import { FiMapPin, FiClock, FiUsers } from "react-icons/fi";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";
import { tourApi } from "@/lib/tourApi";
import { blogApi } from "@/lib/blogApi";
import { TourType, BlogType } from "@/lib/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import ModernTourCardHome from "@/components/ui/ModernTourCardHome";
import BlogCard from "@/components/ui/BlogCard";
import HomeTourPriceDisplay from "@/components/ui/HomeTourPriceDisplay";

// Custom styles for the carousel
const carouselStyles = `
  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    transition: transform 0.3s ease;
  }

  .swiper-slide-active {
    transform: scale(1.1);
  }

  .swiper-pagination {
    bottom: -40px !important;
  }

  .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: #d1d5db;
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background: #059669;
    opacity: 1;
    transform: scale(1.2);
  }
`;

const getLabelStyles = (label: string) => {
  switch (label) {
    case "Best seller":
      return "bg-accent text-primary";
    case "Popular":
      return "bg-secondary-light text-secondary-dark";
    case "Recommended":
      return "bg-primary text-white";
    case "Best Value":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-neutral-200 text-text-secondary";
  }
};

export default function Home() {
  const [tours, setTours] = useState<TourType[]>([]);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const response = await tourApi.getTours({ limit: 10 });
        if (response.success) {
          const sortedTours = response.data.sort((a, b) => {
            const aHasLabel = !!a.label;
            const bHasLabel = !!b.label;
            if (aHasLabel && !bHasLabel) return -1;
            if (!aHasLabel && bHasLabel) return 1;
            // both have or don't have label, sort by price ascending
            return a.newPrice - b.newPrice;
          });
          setTours(sortedTours);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsBlogsLoading(true);
        const response = await blogApi.getBlogs({ limit: 3 });
        if (response.success) {
          setBlogs(response.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsBlogsLoading(true);
        const response = await blogApi.getBlogs({ limit: 3 });
        if (response.success) {
          setBlogs(response.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, []);
  return (
    <div className="min-h-screen bg-neutral-50 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: carouselStyles }} />

      {/* Hero */}
      <header className="hidden md:block max-w-6xl mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-10 items-center">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-light text-secondary text-xs font-semibold">
              <FiMapPin className="text-secondary" />
              Cameron Highlands, Malaysia
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Quietly elevated journeys across the Highlands.
            </h1>
            <p className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
              Curated tours, balanced pacing, and tasteful stays—designed for
              travelers who value calm, thoughtful details.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary justify-center md:justify-start">
              {[
                "Trusted local guides",
                "Flexible pickups",
                "Small groups",
              ]?.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-white border border-neutral-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="h-80">
              <Swiper
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                coverflowEffect={{
                  rotate: 30,
                  stretch: -20,
                  depth: 150,
                  modifier: 1.5,
                  slideShadows: false,
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                modules={[EffectCoverflow, Autoplay, Pagination]}
                className="h-full"
              >
                {tours.slice(0, 4).map((tour, index) => (
                  <SwiperSlide key={tour._id} className="w-72 max-w-sm">
                    <Link href={`/tours/${tour.slug}`} className="block h-full">
                      <div className="h-80 min-w-max rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-soft hover:shadow-strong transition-all duration-300">
                        <div className="relative h-full">
                          <Image
                            src={tour.image}
                            alt={tour.title}
                            fill
                            className="object-cover h-full"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {tour.label && (
                            <span
                              className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getLabelStyles(
                                tour.label,
                              )}`}
                            >
                              {tour.label}
                            </span>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-bold mb-3">
                              {tour.title}
                            </h3>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                  RM {tour.newPrice}
                                </span>
                                {tour.oldPrice &&
                                  tour.oldPrice > tour.newPrice && (
                                    <>
                                      <span className="text-sm text-white/70 line-through">
                                        RM {tour.oldPrice}
                                      </span>
                                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                        {Math.round(
                                          (1 - tour.newPrice / tour.oldPrice) *
                                            100,
                                        )}
                                        % OFF
                                      </span>
                                    </>
                                  )}
                              </div>
                              <HomeTourPriceDisplay price={tour.newPrice} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </header>

      {/* Tours */}
      <section className="max-w-6xl mx-auto px-4 pb-14 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Featured tours</h2>
          <p className="text-text-secondary text-sm">
            {isLoading
              ? "Loading tours..."
              : `${tours.length} departures ready to book.`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tours.map((tour) => (
              <ModernTourCardHome
                key={tour._id}
                id={tour._id}
                slug={tour.slug}
                title={tour.title}
                description={tour.description}
                image={tour.image}
                duration={tour.duration}
                price={tour.newPrice}
                originalPrice={tour.oldPrice}
                rating={tour.rating || 4.8}
                reviewCount={tour.adminReviewCount ?? tour.reviewCount ?? 220}
                label={tour.label || undefined}
                category={tour.type}
                bookedCount={tour.bookedCount}
                type={tour.type}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-3 pb-16">
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-soft py-6 px-4 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-text-light mb-2">
              Need a hand?
            </p>
            <h3 className="text-2xl font-semibold mb-2">
              We curate calm, well-paced itineraries.
            </h3>
            <p className="text-text-secondary text-sm">
              Do email-real humans will help you pick.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="mailto:mossyforesttours@gmail.com"
              className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              ✉️ mossyforesttours@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-2xl font-bold">Stories from the Highlands</h2>
          <p className="text-text-secondary text-sm">
            Discover travel tips, local insights, and highland inspiration
          </p>
        </div>

        {isBlogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} {...blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <p>No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
