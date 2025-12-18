"use client";

import Image from "next/image";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import Tag from "./Tag";
import GreenBtn from "./GreenBtn";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatBookedCount } from "@/lib/utils";
import { calculateOfferPercentage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

type TourCardProps = {
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

export default function TourCard({
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
}: TourCardProps) {
  // Label styling based on type
  const getLabelStyles = (labelType: string) => {
    switch (labelType) {
      case "Recommended":
        return "bg-purple-600 text-white";
      case "Popular":
        return "bg-orange-500 text-white";
      case "Best Value":
        return "bg-blue-500 text-white";
      case "Best seller":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  const router = useRouter();

  const truncate = (s?: string, n = 65) => {
    if (!s) return "";
    return s.length > n ? s.slice(0, n).trimEnd() + "..." : s;
  };

  const navigate = (e?: MouseEvent | KeyboardEvent) => {
    // allow callers to pass an event; if it's a keyboard event check for Enter
    if (e && "key" in e && (e as KeyboardEvent).key !== "Enter") return;
    router.push(`/tours/${slug}`);
  };

  const offerPercentage = calculateOfferPercentage(oldPrice, newPrice);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={(e) => navigate(e)}
      onKeyDown={(e) => navigate(e)}
      className="rounded-xl shadow-lg bg-white flex flex-col justify-between max-h-max relative cursor-pointer"
    >
      {/* Label Badge */}
      {label && (
        <div
          className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold ${getLabelStyles(
            label
          )}`}
        >
          {label}
        </div>
      )}
      <Image
        src={resolveImageUrl(image)}
        alt={title}
        width={400}
        height={400}
        className="h-48 w-full object-cover rounded-t-lg"
        onError={(e) => {
          console.error("Image failed to load:", {
            originalPath: image,
            resolvedUrl: resolveImageUrl(image),
            title: title,
          });
        }}
      />
      <div className="p-4 flex flex-col justify-between gap-2 self-start">
        <h3 className="text-primary_green font-semibold font-poppins text-base">
          {title}
        </h3>
        <div className="flex gap-2">
          {tags.map((tag, i) => (
            <Tag key={i} tag={tag} />
          ))}
        </div>
        <p className="text-desc_gray text-sm font-poppins">
          {truncate(description, 65)}
        </p>
        <div className="flex justify-between gap-2">
          <div className="flex gap-2 items-center font-semibold">
            <MdAccessTimeFilled
              width={30}
              className="text-primary_green text-lg"
            />
            <p className="text-sm">{duration} hrs</p>
          </div>
          <div className="flex gap-2 items-center font-semibold">
            <FaBookmark width={30} className="text-gray-700 text-md" />
            <p className="text-sm text-gray-700">{formatBookedCount(bookedCount)} Booked</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col items-start">
            <p className="text-gray-400 line-through font-poppins text-base ">
              {oldPrice}
            </p>
            <h4 className="font-poppins text-xl font-bold">
              {newPrice} RM{" "}
              <span className="text-sm font-light">
                {type === "private" ? "/group" : "/person"}
              </span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              ${Math.round(newPrice * 0.22)} / €{Math.round(newPrice * 0.21)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          {/* Offer Badge moved here */}
          {oldPrice && newPrice && offerPercentage > 0 && (
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md border border-red-600 w-fit">
              {offerPercentage}% OFF
            </div>
          )}
          
          {/* Review/Rating Badge moved from image top */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">4.8</span>
            <span className="text-xs text-gray-500">(10k+)</span>
          </div>
        </div>
        
        <GreenBtn
          text="Book Now"
          customStyles="font-semibold w-full mt-2"
          action={`/user-info?tour=${slug}`}
          onClick={(ev) => {
            // prevent parent navigation when clicking the button
            ev?.stopPropagation();
            // navigate directly to user info flow
            router.push(`/user-info?tour=${slug}`);
          }}
        />
      </div>
    </div>
    </div>
  );
}
