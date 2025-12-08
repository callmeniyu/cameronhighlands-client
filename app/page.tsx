"use client";

import Link from "next/link";
import Image from "next/image";
import { FiMapPin, FiClock, FiUsers } from "react-icons/fi";
import { IoStar } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

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

// Static dummy tour data (UI-first; no backend dependency)
const DUMMY_TOURS = [
  {
    id: "1",
    slug: "mossy-forest-adventure",
    title: "Mossy Forest Adventure",
    description:
      "Explore the mystical Mossy Forest with its unique cloud forest ecosystem. Experience the ethereal beauty of moss-covered trees and rare flora.",
    image: "/images/tour1.jpg",
    duration: "4 Hours",
    price: 85,
    originalPrice: 120,
    rating: 4.9,
    reviewCount: 328,
    label: "Best Seller",
    category: "Nature",
  },
  {
    id: "2",
    slug: "sunrise-viewpoint-tour",
    title: "Sunrise Viewpoint Tour",
    description:
      "Witness breathtaking sunrise views from the highest viewpoints in Cameron Highlands. A magical early morning experience you won't forget.",
    image: "/images/tour2.jpg",
    duration: "3 Hours",
    price: 65,
    originalPrice: 90,
    rating: 4.8,
    reviewCount: 256,
    label: "Popular",
    category: "Scenic",
  },
  {
    id: "3",
    slug: "tea-plantation-tour",
    title: "BOH Tea Plantation Tour",
    description:
      "Visit the famous BOH tea plantations, learn about tea processing, and enjoy fresh tea with stunning valley views.",
    image: "/images/tour3.jpg",
    duration: "5 Hours",
    price: 75,
    originalPrice: 95,
    rating: 4.7,
    reviewCount: 412,
    label: "Recommended",
    category: "Cultural",
  },
  {
    id: "4",
    slug: "strawberry-farm-experience",
    title: "Strawberry Farm Experience",
    description:
      "Pick fresh strawberries, taste local strawberry products, and explore beautiful flower gardens in this family-friendly tour.",
    image: "/images/tour4.jpg",
    duration: "3 Hours",
    price: 55,
    originalPrice: 70,
    rating: 4.6,
    reviewCount: 189,
    label: null,
    category: "Family",
  },
];

const getLabelStyles = (label: string) => {
  switch (label) {
    case "Best Seller":
      return "bg-accent text-primary";
    case "Popular":
      return "bg-secondary-light text-secondary-dark";
    case "Recommended":
      return "bg-primary text-white";
    default:
      return "bg-neutral-200 text-text-secondary";
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: carouselStyles }} />

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-4 pt-20 pb-14 md:pb-16">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-light text-secondary text-xs font-semibold">
              <FiMapPin className="text-secondary" />
              Cameron Highlands, Malaysia
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Quietly elevated journeys across the Highlands.
            </h1>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl">
              Four curated tours, balanced pacing, and tasteful stays—designed
              for travelers who value calm, thoughtful details.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
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

          <div className="relative">
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
                {DUMMY_TOURS.slice(0, 4).map((tour, index) => (
                  <SwiperSlide key={tour.id} className="w-72 max-w-sm">
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
                                <span>{tour.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold">
                                  RM {tour.price}
                                </span>
                                {tour.originalPrice && (
                                  <span className="text-sm text-white/70 line-through">
                                    RM {tour.originalPrice}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-white/80">
                                ({tour.reviewCount} reviews)
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
                              {tour.category}
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
            {DUMMY_TOURS.length} departures ready to book.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_TOURS.map((tour, index) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group block h-full"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <article className="h-full rounded-3xl bg-white border border-neutral-200 shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {tour.label && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getLabelStyles(
                        tour.label
                      )}`}
                    >
                      {tour.label}
                    </span>
                  )}

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 text-xs font-semibold text-text-primary shadow-sm">
                    <IoStar className="text-amber-400" />
                    {tour.rating} ({tour.reviewCount})
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="px-3 py-1 rounded-full bg-secondary-light text-secondary-dark font-semibold">
                      {tour.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-neutral-100 text-text-secondary">
                      {tour.duration}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                      {tour.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-secondary" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-secondary" />
                      Small groups
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      {tour.originalPrice > tour.price && (
                        <span className="text-xs text-text-light line-through">
                          RM {tour.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary">
                        RM {tour.price}
                      </span>
                      <span className="text-text-secondary text-xs">
                        /person
                      </span>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold rounded-full border border-neutral-300 bg-white hover:border-primary hover:text-primary transition-colors">
                      View details
                    </button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
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
              href="tel:+60123456789"
              className="px-4 py-2 rounded-full border border-neutral-300 hover:border-primary hover:text-primary transition-colors"
            >
              📞 +60 12-345 6789
            </a>
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
