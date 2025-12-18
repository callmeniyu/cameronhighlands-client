"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdAccessTime, MdPeople } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatBookedCount } from "@/lib/utils";
import { calculateOfferPercentage } from "@/lib/utils";
import type { KeyboardEvent, MouseEvent } from "react";

type ModernTourCardProps = {
  _id: string;
  slug: string;
  image: string;
  title: string;
  tags: string[];
  description: string;
  duration: string;
  bookedCount: string | number;
  oldPrice: number;
  newPrice: number;
  type: string;
  label?: string | null;
};

export default function ModernTourCard({
  _id,
  slug,
  image,
  title,
  description,
  duration,
  tags,
  bookedCount,
  oldPrice,
  newPrice,
  type,
  label,
}: ModernTourCardProps) {
  const router = useRouter();

  const truncate = (s?: string, n = 80) => {
    if (!s) return "";
    return s.length > n ? s.slice(0, n).trimEnd() + "..." : s;
  };

  const navigate = (e?: MouseEvent | KeyboardEvent) => {
    if (e && "key" in e && (e as KeyboardEvent).key !== "Enter") return;
    router.push(`/tours/${slug}`);
  };

  const handleBookNow = (e?: MouseEvent | KeyboardEvent) => {
    if (e && "stopPropagation" in e) (e as MouseEvent).stopPropagation();
    // Directly route to user-info with static tour query param
    router.push(`/user-info?tour=${slug}`);
  };

  const offerPercentage = calculateOfferPercentage(oldPrice, newPrice);

  // Label styling
  const getLabelStyles = (labelType: string) => {
    switch (labelType) {
      case "Recommended":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case "Popular":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
      case "Best Value":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "Best seller":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-neutral-500 to-neutral-600 text-white";
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={(e) => navigate(e)}
      onKeyDown={(e) => navigate(e)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden bg-neutral-200">
        <Image
          src={resolveImageUrl(image)}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges container */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          {/* Label Badge */}
          {label && (
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getLabelStyles(
                label
              )} backdrop-blur-sm`}
            >
              {label}
            </span>
          )}

          {/* Discount Badge */}
          {oldPrice && newPrice && offerPercentage > 0 && (
            <span className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold bg-accent text-neutral-900 shadow-lg">
              {offerPercentage}% OFF
            </span>
          )}
        </div>

        {/* Booked count badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
          <MdPeople className="text-primary text-sm" />
          <span className="text-xs font-semibold text-neutral-700">
            {formatBookedCount(bookedCount)} booked
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
          {truncate(description)}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-secondary-light text-secondary text-xs font-medium rounded-lg"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <MdAccessTime className="text-primary text-base" />
            <span className="text-xs font-medium">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <IoLocationSharp className="text-secondary text-base" />
            <span className="text-xs font-medium">Cameron Highlands</span>
          </div>
        </div>

        {/* Price section */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex flex-col">
            {oldPrice && oldPrice > newPrice && (
              <span className="text-xs text-text-light line-through">
                RM {oldPrice}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                RM {newPrice}
              </span>
              <span className="text-xs text-text-secondary font-medium">
                /person
              </span>
            </div>
            <div className="text-xs text-text-light mt-0.5">
              ${Math.round(newPrice * 0.22)} / €{Math.round(newPrice * 0.21)}
            </div>
          </div>

          {/* Book Now Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
