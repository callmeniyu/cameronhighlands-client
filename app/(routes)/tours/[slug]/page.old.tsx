import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import TourCard from "@/components/ui/TourCard";
import TransferCard from "@/components/ui/TransferCard";
import FAQSection from "@/components/sections/FAQSection";
import GreenBtn from "@/components/ui/GreenBtn";
import { FaBookmark } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { RiRouteFill } from "react-icons/ri";
import { RiMapPinLine } from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";
import { tourApi } from "@/lib/tourApi";
import { transferApi } from "@/lib/transferApi";
import { TourType } from "@/lib/types";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatBookedCount } from "@/lib/utils";
import { calculateOfferPercentage } from "@/lib/utils";
import {
  generateTourMetadata,
  generateTourStructuredData,
} from "@/lib/seoUtils";
import BookNowButton from "@/components/ui/BookNowButton";

// Enable dynamic routing for new tours
export const dynamicParams = true;

// Enable ISR with 5 minute revalidation for fresh data
export const revalidate = 300;

type TourDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await tourApi.getTourBySlug(slug);
    const tour = response.data;

    if (!tour || !response.success) {
      return {
        title: "Tour Not Found - Oastel",
        description: "The requested tour could not be found.",
      };
    }

    return generateTourMetadata(tour);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tour - Oastel",
      description: "Discover amazing tours in Cameron Highlands with Oastel.",
    };
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const response = await tourApi.getTours({ limit: 1000 });
    if (!response.success) {
      console.error("Error generating static params:", response);
      return [];
    }
    return (
      response.data?.map((tour: any) => ({
        slug: tour.slug,
      })) || []
    );
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;

  // Fetch tour details with cache revalidation
  let tourDetails: TourType | null = null;
  try {
    const response = await tourApi.getTourBySlug(slug);
    if (!response.success) {
      console.error("Error fetching tour:", response);
      notFound();
    }
    tourDetails = response.data;
  } catch (error) {
    console.error("Error fetching tour:", error);
    notFound();
  }

  if (!tourDetails) {
    notFound();
  }

  const offerPercentage = calculateOfferPercentage(
    tourDetails.oldPrice,
    tourDetails.newPrice
  );

  // Fetch other tours and transfers for recommendations
  let otherTours: any[] = [];
  try {
    const [allToursResponse, allTransfersResponse] = await Promise.all([
      tourApi.getTours({ limit: 100 }),
      transferApi.getTransfers({ limit: 100 }),
    ]);

    const allToursData = allToursResponse;
    const allTransfersData = allTransfersResponse;

    // Separate tours and transfers, exclude current tour
    const availableTours =
      allToursData.data?.filter((tour: any) => tour.slug !== slug) || [];
    const availableTransfers = allTransfersData.data || [];

    const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

    const selectedTours = shuffle(availableTours).slice(0, 2);
    const selectedTransfers = shuffle(availableTransfers).slice(0, 2);

    // Interleave selections so UX shows mixed packages
    const combined: any[] = [];
    for (
      let i = 0;
      i < Math.max(selectedTours.length, selectedTransfers.length);
      i++
    ) {
      if (selectedTours[i]) combined.push(selectedTours[i]);
      if (selectedTransfers[i]) combined.push(selectedTransfers[i]);
    }

    otherTours = combined;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Continue without recommendations
  }

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 font-poppins">
      <div className="flex flex-col lg:flex-row gap-8 md:px-8 lg:px-16">
        <div className="flex-1 space-y-6">
          <Image
            src={resolveImageUrl(tourDetails.image)}
            alt={tourDetails.title}
            width={700}
            height={500}
            className="rounded-xl sm:w-full sm:h-[25rem] object-cover"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold sm:font-bold text-primary_green">
              {tourDetails.title}
            </h1>
            <p className="text-desc_gray mt-2">{tourDetails.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {tourDetails.tags.map((tag, i) => (
                <Tag key={i} tag={tag} />
              ))}
            </div>
          </div>

          {/* ✅ Booking Panel for small screens */}
          <div className="block lg:hidden bg-white border rounded-md p-4 shadow-sm mt-6">
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-400 line-through">
                  RM {tourDetails.oldPrice}
                </p>
                {offerPercentage > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {offerPercentage}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-lg">
                <span className="text-3xl font-extrabold sm:font-bold">
                  RM {tourDetails.newPrice}
                </span>
                {tourDetails.type === "private" ? " / group" : " / person"}
              </h2>
              <div className="flex items-center w-full gap-3">
                <FaBookmark className="text-xl text-primary_green" />
                <span className="font-semibold text-lg">
                  {formatBookedCount(tourDetails.bookedCount)} Booked
                </span>
              </div>

              {/* Larger full-width booking button for small screens */}
            </div>

            <BookNowButton
              bookingUrl={`/user-info?tour=${tourDetails.slug}`}
              isAvailable={tourDetails.isAvailable !== false}
              packageName={tourDetails.title}
              text="Book Now"
              customStyles="w-full py-4 text-lg font-bold rounded-lg"
              packageSlug={tourDetails.slug}
              packageType="tour"
            />
          </div>

          <div className="space-y-6 mt-6">
            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center">
                <BsInfoCircleFill className="text-xl text-primary_green" />
                <h5 className="font-semibold text-primary_green">
                  About this tour
                </h5>
              </div>
              <div
                className="prose max-w-none text-sm text-desc_gray mt-2"
                dangerouslySetInnerHTML={{ __html: tourDetails.details.about }}
              />
            </div>

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center">
                <FaClock className="text-xl text-primary_green" />
                <h5 className="font-semibold text-primary_green">
                  Departure Times
                </h5>
              </div>
              <ul className="mt-2 space-y-1">
                {tourDetails.departureTimes.map((time, index) => (
                  <li key={index} className="text-sm text-desc_gray ml-5">
                    {time}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="p-0.5 rounded-full bg-primary_green">
                  <RiRouteFill className="text-lg text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">Itinerary</h5>
              </div>
              <div
                className="prose max-w-none text-sm text-desc_gray mt-2"
                dangerouslySetInnerHTML={{
                  __html: tourDetails.details.itinerary,
                }}
              />
            </div>

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="p-0.5 rounded-full bg-primary_green">
                  <RiMapPinLine className="text-lg text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">
                  Pickup Location
                </h5>
              </div>
              <div
                className="prose max-w-none text-sm text-desc_gray mt-2"
                dangerouslySetInnerHTML={{
                  __html: tourDetails.details.pickupLocation || "",
                }}
              />
            </div>

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="p-1 rounded-full bg-primary_green">
                  <IoWarningOutline className="text-lg text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">Note</h5>
              </div>
              {tourDetails.details.note && (
                <div
                  className="prose max-w-none text-sm text-desc_gray mt-2"
                  dangerouslySetInnerHTML={{ __html: tourDetails.details.note }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ✅ Booking Panel for large screens */}
        <div className="w-full lg:w-80 shrink-0 hidden lg:block">
          <div className="bg-white border-2 border-primary_green rounded-xl shadow-lg p-6 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg text-gray-400 line-through">
                  RM {tourDetails.oldPrice}
                </p>
                {offerPercentage > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {offerPercentage}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-lg mb-2">
                <span className="text-4xl font-extrabold">
                  RM {tourDetails.newPrice}
                </span>{" "}
                <span className="text-base font-medium text-desc_gray">
                  {tourDetails.type === "private" ? " / group" : " / person"}
                </span>
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <FaBookmark className="text-primary_green inline-block mr-1" />
                <span className="font-semibold text-desc_gray">
                  {formatBookedCount(tourDetails.bookedCount)} Booked
                </span>
              </div>
            </div>
            <BookNowButton
              bookingUrl={`/user-info?tour=${tourDetails.slug}`}
              isAvailable={tourDetails.isAvailable !== false}
              packageName={tourDetails.title}
              text="Book Now"
              customStyles="w-full py-4 text-lg font-bold rounded-lg"
              packageSlug={tourDetails.slug}
              packageType="tour"
            />
          </div>
        </div>
      </div>

      <section>
        <FAQSection faqs={tourDetails.details.faq} />
      </section>

      <section className="bg-white border rounded-md px-6 py-10 shadow-sm flex flex-col md:flex-row gap-6 mx-4 md:mx-10">
        <div className="md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold text-primary_green">
            Terms & Conditions
          </h2>
          <p className="text-sm text-desc_gray">
            We recommend you go through terms and cancellation policies before
            booking.
          </p>
        </div>
        {/* Divider */}
        <hr className="hidden md:block border border-gray-200 w-40 rotate-90 self-center" />
        <hr className="block md:hidden border border-gray-200 w-full" />
        <div className="flex justify-center md:w-1/2">
          <GreenBtn
            text="📄 See T&C"
            action={"/privacy-policy"}
            customStyles="w-32"
          />
        </div>
      </section>

      {/* Book Button */}
      <div className="text-center">
        <BookNowButton
          bookingUrl={`/user-info?tour=${tourDetails.slug}`}
          isAvailable={tourDetails.isAvailable !== false}
          packageName={tourDetails.title}
          text="Book this tour"
          customStyles="w-72 py-5 text-xl font-medium"
          packageSlug={tourDetails.slug}
          packageType="tour"
        />
      </div>

      {/* Other Tours */}
      <section>
        <div className="flex items-center gap-2">
          <hr className="border-b-2 border-primary_green w-16 sm:w-40 md:flex" />
          <h2 className="text-2xl font-extrabold sm:font-bold text-primary_green mb-4 pt-2  min-w-max">
            Other Packages
          </h2>
          <hr className="border-b-2 border-primary_green  w-full  md:flex" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherTours.map((packageItem, i) =>
            // Render using explicit packageType if available
            packageItem.packageType === "transfer" ? (
              <TransferCard key={i} {...packageItem} />
            ) : (
              <TourCard key={i} {...packageItem} />
            )
          )}
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateTourStructuredData(tourDetails)),
        }}
      />
    </div>
  );
}
