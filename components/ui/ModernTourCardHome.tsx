"use client";

import Image from "next/image";
import Link from "next/link";
import { FiClock } from "react-icons/fi";
import { IoStar } from "react-icons/io5";

type ModernTourCardHomeProps = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  label?: string;
  category: string;
};

export default function ModernTourCardHome({
  id,
  slug,
  title,
  description,
  image,
  duration,
  price,
  originalPrice,
  rating,
  reviewCount,
  label,
  category,
}: ModernTourCardHomeProps) {
  const getLabelStyles = (labelType: string) => {
    switch (labelType) {
      case "Best Seller":
        return "bg-red-500 text-white";
      case "Popular":
        return "bg-orange-500 text-white";
      case "Recommended":
        return "bg-purple-500 text-white";
      default:
        return "bg-primary text-white";
    }
  };

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  return (
    <Link href={`/tours/${slug}`} className="group block h-full">
      <article className="h-full rounded-3xl bg-white border border-neutral-200 shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden flex flex-col">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {label && (
            <span
              className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getLabelStyles(
                label
              )}`}
            >
              {label}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="px-3 py-1 rounded-full bg-secondary-light text-secondary-dark font-semibold">
              {category}
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-text-secondary">
              {duration}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <FiClock className="text-secondary" />
              {duration}
            </div>
            <span className="text-xs font-semibold text-gray-800">
              10k+ booked
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-xs text-text-light line-through">
                      RM {originalPrice}
                    </span>
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  RM {price}
                </span>
                <span className="text-text-secondary text-xs">/person</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>${Math.round(price * 0.22)}</span>
                <span>•</span>
                <span>€{Math.round(price * 0.21)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <IoStar className="text-amber-400" />
                {rating} ({reviewCount})
              </div>
              <button className="px-4 py-2 text-sm font-semibold rounded-full border border-neutral-300 bg-white hover:border-primary hover:text-primary transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
