import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import TourCard from "@/components/ui/TourCard";
import TransferCard from "@/components/ui/TransferCard";
import FAQSection from "@/components/sections/FAQSection";
import GreenBtn from "@/components/ui/GreenBtn";
import BookNowButton from "@/components/ui/BookNowButton";
import { FaBookmark } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { RiRouteFill } from "react-icons/ri";
import { RiMapPinLine } from "react-icons/ri";
import { IoWarningOutline } from "react-icons/io5";
import { transferApi } from "@/lib/transferApi";
import { tourApi } from "@/lib/tourApi";
import { FaBus, FaWalking } from "react-icons/fa";
import {
  generateTransferMetadata,
  generateTransferStructuredData,
} from "@/lib/seoUtils";
import TransferSEOLinks from "@/components/ui/TransferSEOLinks";
import { calculateOfferPercentage } from "@/lib/utils";

// Enable ISR with 5 minute revalidation for fresh data
export const revalidate = 300;

type TransferDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: TransferDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await transferApi.getTransferBySlug(slug);
    if (!response.success || !response.data) {
      return {
        title: "Transfer Not Found - Oastel",
        description: "The requested transfer could not be found.",
      };
    }

    return generateTransferMetadata(response.data);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Transfer - Oastel",
      description:
        "Comfortable transfers across Cameron Highlands with Oastel.",
    };
  }
}

// Enable dynamic params for ISR
export const dynamicParams = true;

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const response = await transferApi.getTransfers({ limit: 1000 });
    return response.data.map((transfer: any) => ({
      slug: transfer.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TransferDetailPage({
  params,
}: TransferDetailPageProps) {
  const { slug } = await params;

  // Fetch transfer details
  let transferDetails: any = null;
  try {
    const response = await transferApi.getTransferBySlug(slug);
    if (!response.success) {
      console.error("Error fetching transfer by slug:", response);
      notFound();
    }
    transferDetails = response.data;
  } catch (error) {
    console.error("Error fetching transfer by slug:", error);
    notFound();
  }

  if (!transferDetails) {
    notFound();
  }

  const offerPercentage = calculateOfferPercentage(
    transferDetails.oldPrice,
    transferDetails.newPrice
  );

  // Utility to strip HTML tags
  const stripHtmlTags = (html: string) => {
    if (!html) return "";
    // If running in a browser, prefer the DOM parser for accuracy
    if (typeof document !== "undefined") {
      try {
        const div = document.createElement("div");
        div.innerHTML = html;
        return (div.textContent || div.innerText || "").trim();
      } catch (e) {
        // fall through to regex fallback
      }
    }
    // Server-safe fallback: remove tags via regex and collapse whitespace
    try {
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    } catch (e) {
      return html;
    }
  };

  // Get other packages (both transfers and tours)
  let otherPackages: any[] = [];
  try {
    const [transfersResponse, toursResponse] = await Promise.all([
      transferApi.getTransfers({ limit: 100 }),
      tourApi.getTours({ limit: 100 }),
    ]);

    if (transfersResponse.success && toursResponse.success) {
      // Separate transfers and tours, exclude current transfer
      const availableTransfers = transfersResponse.data.filter(
        (t: any) => t.slug !== slug
      );
      const availableTours = toursResponse.data;

      const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

      const selectedTransfers = shuffle(availableTransfers).slice(0, 2);
      const selectedTours = shuffle(availableTours).slice(0, 2);

      // Interleave selections
      const combined: any[] = [];
      for (
        let i = 0;
        i < Math.max(selectedTransfers.length, selectedTours.length);
        i++
      ) {
        if (selectedTransfers[i]) combined.push(selectedTransfers[i]);
        if (selectedTours[i]) combined.push(selectedTours[i]);
      }

      otherPackages = combined;
    }
  } catch (error) {
    console.error("Error fetching other packages:", error);
  }

  if (!transferDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">transfer not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 font-poppins">
      <div className="flex flex-col lg:flex-row gap-8 md:px-8 lg:px-16">
        <div className="flex-1 space-y-6">
          <Image
            src={transferDetails.image}
            alt={transferDetails.title}
            width={700}
            height={500}
            className="rounded-xl sm:w-full sm:h-[25rem] object-cover"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold sm:font-bold text-primary_green">
              {transferDetails.title}
            </h1>
            <p className="text-desc_gray mt-2">{transferDetails.desc}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {transferDetails.tags.map((tag: string, i: number) => (
                <Tag key={i} tag={tag} />
              ))}
            </div>
          </div>

          {/* ✅ Booking Panel for small screens */}
          <div className="block lg:hidden bg-white border rounded-md p-4 shadow-sm mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-400 line-through">
                  RM {transferDetails.oldPrice}
                </p>
                {offerPercentage > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {offerPercentage}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-extrabold sm:font-bold">
                RM {transferDetails.newPrice}
                <span className="">
                  {transferDetails.type === "Private" ? "/vehicle" : "/person"}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <FaBookmark className="text-primary_green inline-block mr-1" />
                <span className="font-semibold">
                  {transferDetails.bookedCount} Booked
                </span>
              </div>
            </div>
            <BookNowButton
              bookingUrl={`/user-info?transfer=${transferDetails.slug}`}
              isAvailable={transferDetails.isAvailable !== false}
              packageName={transferDetails.title}
              text="Book Now"
              customStyles="w-full py-4 text-lg font-bold rounded-lg"
              packageSlug={transferDetails.slug}
              packageType="transfer"
            />
          </div>

          <div className="space-y-6 mt-6">
            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center">
                <div className="p-1 rounded-full bg-primary_green">
                  <FaBus className="text-sm text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">From</h5>
              </div>
              <div className="prose max-w-none text-sm text-desc_gray mt-2">
                {transferDetails.from}
              </div>
            </div>
            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center">
                <div className="p-1 rounded-full bg-primary_green">
                  <FaWalking className="text-md text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">To</h5>
              </div>
              <div className="prose max-w-none text-sm text-desc_gray mt-2">
                {transferDetails.to}
              </div>
            </div>
            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center">
                <BsInfoCircleFill className="text-xl text-primary_green" />
                <h5 className="font-semibold text-primary_green">
                  About this transfer
                </h5>
              </div>
              <div
                className="prose max-w-none text-sm text-desc_gray mt-2"
                dangerouslySetInnerHTML={{
                  __html: transferDetails.details.about,
                }}
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
                {transferDetails.times.map((time: string, index: number) => (
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
                  __html: transferDetails.details.itinerary,
                }}
              />
            </div>

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="p-0.5 rounded-full bg-primary_green">
                  <RiMapPinLine className="text-lg text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">
                  {transferDetails.details.pickupOption === "user"
                    ? "Pickup Guidelines"
                    : "Pickup Location"}
                </h5>
              </div>
              <div className="prose max-w-none text-sm text-desc_gray mt-2">
                {transferDetails.details.pickupOption === "user" ? (
                  // For user-defined pickup, show guidelines/instructions
                  <div
                    dangerouslySetInnerHTML={{
                      __html: transferDetails.details.pickupLocations,
                    }}
                  />
                ) : (
                  // For admin-defined pickup, show locations as plain text
                  stripHtmlTags(transferDetails.details.pickupLocations)
                )}
              </div>
            </div>

            {transferDetails.details.dropOffLocations && (
              <div className="bg-white border rounded-md p-4 shadow-sm">
                <div className="flex gap-2 items-center mb-2">
                  <div className="p-0.5 rounded-full bg-primary_green">
                    <RiMapPinLine className="text-lg text-white" />
                  </div>
                  <h5 className="font-semibold text-primary_green">
                    Drop-off Location
                  </h5>
                </div>
                <div className="prose max-w-none text-sm text-desc_gray mt-2">
                  {stripHtmlTags(transferDetails.details.dropOffLocations)}
                </div>
              </div>
            )}

            <div className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="p-1 rounded-full bg-primary_green">
                  <IoWarningOutline className="text-lg text-white" />
                </div>
                <h5 className="font-semibold text-primary_green">Note</h5>
              </div>
              <div
                className="prose max-w-none text-sm text-desc_gray mt-2"
                dangerouslySetInnerHTML={{
                  __html:
                    transferDetails.details.note ||
                    "No additional notes provided.",
                }}
              />
            </div>
          </div>
        </div>

        {/* ✅ Booking Panel for large screens (match tours detail UI) */}
        <div className="w-full lg:w-80 shrink-0 hidden lg:block">
          <div className="bg-white border-2 border-primary_green rounded-xl shadow-lg p-6 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg text-gray-400 line-through">
                  RM {transferDetails.oldPrice}
                </p>
                {offerPercentage > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {offerPercentage}% OFF
                  </span>
                )}
              </div>
              <h2 className="text-lg mb-2">
                <span className="text-4xl font-extrabold">
                  RM {transferDetails.newPrice}
                </span>{" "}
                <span className="text-base font-medium text-desc_gray">
                  {transferDetails.type === "Private" ? "/vehicle" : "/person"}
                </span>
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <FaBookmark className="text-primary_green inline-block mr-1" />
                <span className="font-semibold text-desc_gray">
                  {transferDetails.bookedCount} Booked
                </span>
              </div>
            </div>
            <BookNowButton
              bookingUrl={`/user-info?transfer=${transferDetails.slug}`}
              isAvailable={transferDetails.isAvailable !== false}
              packageName={transferDetails.title}
              text="Book Now"
              customStyles="w-full py-4 text-lg font-bold rounded-lg"
              packageSlug={transferDetails.slug}
              packageType="transfer"
            />
          </div>
        </div>
      </div>

      <section>
        <FAQSection faqs={transferDetails.details.faq} />
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
          bookingUrl={`/user-info?transfer=${transferDetails.slug}`}
          isAvailable={transferDetails.isAvailable !== false}
          packageName={transferDetails.title}
          text="Book this transfer"
          packageSlug={transferDetails.slug}
          packageType="transfer"
        />
      </div>

      {/* Other Packages */}
      <section>
        <div className="flex items-center gap-2">
          <hr className="border-b-2 border-primary_green w-16 sm:w-40 md:flex" />
          <h2 className="text-2xl font-extrabold sm:font-bold text-primary_green mb-4 pt-2  min-w-max">
            Other Tours/Transfers
          </h2>
          <hr className="border-b-2 border-primary_green  w-full  md:flex" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherPackages.map((pkg: any, i: number) =>
            pkg.packageType === "transfer" ? (
              <TransferCard key={`transfer-${i}`} {...pkg} />
            ) : (
              <TourCard key={`tour-${i}`} {...pkg} />
            )
          )}
        </div>
      </section>

      {/* SEO Internal Links */}
      <TransferSEOLinks
        currentTransfer={{
          from: transferDetails.from,
          to: transferDetails.to,
          type: transferDetails.type,
          slug: transferDetails.slug,
        }}
        relatedTransfers={otherPackages.filter(
          (pkg) => pkg.packageType === "transfer"
        )}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateTransferStructuredData(transferDetails)
          ),
        }}
      />
    </div>
  );
}
