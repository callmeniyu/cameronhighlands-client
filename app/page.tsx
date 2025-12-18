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
import { TourType } from "@/lib/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import ModernTourCardHome from "@/components/ui/ModernTourCardHome";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const response = await tourApi.getTours({ limit: 10 });
        if (response.success) {
          setTours(response.data);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
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
              Four curated tours, balanced pacing, and tasteful stays—designed
              for travelers who value calm, thoughtful details.
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
                      <div className="h-full rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-soft hover:shadow-strong transition-all duration-300">
                        <div className="relative h-48">
                          <Image
                            src={tour.image}
                            alt={tour.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {tour.label && (
                            <span
                              className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getLabelStyles(
                                tour.label
                              )}`}
                            >
                              {tour.label}
                            </span>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                              {tour.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-white/80 mb-2">
                              <div className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                <span>{tour.duration}</span>
                              </div>
                              <span className="inline-block w-1 h-1 rounded-full bg-white/70" />
                              <div className="flex items-center gap-1">
                                <IoStar className="w-4 h-4 text-yellow-400" />
                                <span>4.8</span>
                              </div>
                              <span className="inline-block w-1 h-1 rounded-full bg-white/70" />
                              <span>
                                {typeof tour.bookedCount === "number"
                                  ? tour.bookedCount
                                  : 0}
                                + booked
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold">
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
                                            (1 -
                                              tour.newPrice / tour.oldPrice) *
                                              100
                                          )}
                                          % OFF
                                        </span>
                                      </>
                                    )}
                                </div>
                                <div className="text-xs text-white/70">
                                  ${Math.round(tour.newPrice * 0.22)} / €
                                  {Math.round(tour.newPrice * 0.21)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/70">
                                  <span>
                                    ${(tour.newPrice * 0.22).toFixed(0)}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    €{(tour.newPrice * 0.21).toFixed(0)}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-white/80">
                                (120+ reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                            {tour.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <span className="px-2 py-1 bg-neutral-100 rounded-full">
                              {tour.type}
                            </span>
                            <span>Book now</span>
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
                rating={4.8}
                reviewCount={120}
                label={tour.label || undefined}
                category={tour.type}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-soft p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-text-light mb-2">
              Need a hand?
            </p>
            <h3 className="text-2xl font-semibold mb-2">
              We curate calm, well-paced itineraries.
            </h3>
            <p className="text-text-secondary text-sm">
              Call or email—real humans will help you pick.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="mailto:hello@cameronhighlandstours.com"
              className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              ✉️ hello@cameronhighlandstours.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
