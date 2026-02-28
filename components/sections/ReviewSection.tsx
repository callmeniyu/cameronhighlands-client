"use client";

import { useState, useEffect } from "react";
import { IoStar, IoStarOutline } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import { format } from "date-fns";
import SessionHook from "@/hooks/SessionHook";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

interface Review {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  images?: string[]; // Array of image URLs
  createdAt: string;
}

interface ReviewSectionProps {
  packageId: string;
  packageType: "tour" | "transfer";
}

export default function ReviewSection({
  packageId,
  packageType,
}: ReviewSectionProps) {
  const { user, isAuthenticated } = SessionHook();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminReviewCount, setAdminReviewCount] = useState<number>(0);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Generate initials for text avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Fetch reviews and check if user has reviewed
  useEffect(() => {
    fetchReviews();
    if (isAuthenticated && user) {
      checkUserReview();
    }
    // fetch admin-defined review count for display
    fetchPackageReviewCount();
  }, [packageId, packageType, isAuthenticated, user]);

  const fetchPackageReviewCount = async () => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/${
        packageType === "tour" ? "tours" : "transfers"
      }/${packageId}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      // API shape: { success: true, data: package }
      const pkg = data?.data || data;
      // Use adminReviewCount if available, fall back to reviewCount for backward compatibility
      const count = pkg?.adminReviewCount ?? pkg?.reviewCount ?? 0;
      setAdminReviewCount(Number(count) || 0);
    } catch (err) {
      console.warn("Failed to fetch package review count:", err);
      setAdminReviewCount(0);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${packageType}/${packageId}`,
      );
      const data = await response.json();

      if (data.success) {
        // Transform the data to match our Review interface
        const transformedReviews = data.data.map((review: any) => ({
          _id: review._id,
          userName: review.userName,
          userImage: review.userId?.image,
          rating: review.rating,
          comment: review.comment,
          images: review.images || [], // Include review images
          createdAt: review.createdAt,
        }));
        setReviews(transformedReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const totalImages = selectedImages.length + fileArray.length;

    if (totalImages > 3) {
      showToast({
        type: "error",
        title: "Too Many Images",
        message: "You can only upload up to 3 images",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        showToast({
          type: "error",
          title: "Invalid File Type",
          message: `${file.name} is not a valid image. Please upload only JPG, PNG, or WEBP files.`,
        });
        return false;
      }

      if (!isValidSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showToast({
          type: "error",
          title: "File Too Large",
          message: `${file.name} (${fileSizeMB}MB) exceeds the 5MB limit. Please reduce the file size or choose a smaller image.`,
        });
        return false;
      }

      return true;
    });

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages([...selectedImages, ...validFiles]);
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviewUrls];

    // Revoke the URL to free memory
    URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviews);
  };

  const checkUserReview = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/reviews/check/${packageType}/${packageId}/${encodeURIComponent(
          user.email,
        )}`,
      );
      const data = await response.json();

      if (data.success) {
        setHasReviewed(data.hasReviewed);
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      showToast({
        type: "error",
        title: "Authentication Required",
        message: "Please login to submit a review",
      });
      return;
    }

    if (rating === 0) {
      showToast({
        type: "error",
        title: "Rating Required",
        message: "Please select a rating",
      });
      return;
    }

    if (comment.trim().length < 10) {
      showToast({
        type: "error",
        title: "Review Too Short",
        message: "Please write at least 10 characters",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append("packageId", packageId);
      formData.append("packageType", packageType);
      formData.append("userName", user.name || "Anonymous");
      formData.append("userEmail", user.email || "");
      formData.append("rating", rating.toString());
      formData.append("comment", comment.trim());

      // Append images if any
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: "POST",
          body: formData, // Send FormData instead of JSON
        },
      );

      const data = await response.json();

      if (data.success) {
        showToast({
          type: "success",
          title: "Review Submitted",
          message: "Review submitted successfully!",
        });
        setHasReviewed(true);
        setShowForm(false);
        setRating(0);
        setComment("");
        setSelectedImages([]);
        setImagePreviewUrls([]);
        fetchReviews(); // Refresh reviews
      } else {
        // Display specific error message from server
        showToast({
          type: "error",
          title: "Submission Failed",
          message: data.message || "Failed to submit review",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast({
        type: "error",
        title: "Submission Error",
        message: "Failed to submit review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
          >
            {star <= (interactive ? hoveredRating || rating : count) ? (
              <IoStar className="text-yellow-400 text-xl" />
            ) : (
              <IoStarOutline className="text-gray-300 text-xl" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12 bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Reviews & Ratings</h2>

      {/* Review Form */}
      {isAuthenticated && !hasReviewed && (
        <div className="mb-8 border-b pb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Rating *
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Share your experience with this tour/transfer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {comment.length}/1000 characters
                </p>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Add Photos (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload up to 3 images (Max 5MB each)
                </p>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={120}
                          height={120}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {selectedImages.length < 3 && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="review-images"
                    />
                    <label
                      htmlFor="review-images"
                      className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300"
                    >
                      📷 Add Photos ({selectedImages.length}/3)
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setRating(0);
                    setComment("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Please{" "}
            <a href="/auth" className="underline font-semibold">
              login
            </a>{" "}
            to write a review.
          </p>
        </div>
      )}

      {isAuthenticated && hasReviewed && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            Thank you for your review! You have already reviewed this{" "}
            {packageType}.
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">
          {reviews.length + adminReviewCount > 0
            ? `All Reviews (${reviews.length + adminReviewCount})`
            : "No Reviews Yet"}
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Be the first to review this {packageType}!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-lg p-4 md:p-6"
            >
              {/* Mobile: Avatar floated left with text wrapping */}
              <div className="md:flex md:items-start md:gap-4">
                <div className="float-left mr-3 mb-2 md:float-none md:mr-0 md:mb-0 md:flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {review.userImage ? (
                      <Image
                        src={review.userImage}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover"
                        unoptimized={review.userImage.includes(
                          "googleusercontent.com",
                        )}
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm">
                        {getInitials(review.userName)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{review.userName}</h4>
                  </div>

                  <div className="mb-3">{renderStars(review.rating)}</div>

                  <p className="text-gray-700 whitespace-pre-wrap mb-3">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={imageUrl}
                            alt={`Review image ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-32 h-24 md:w-40 md:h-30 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-500 text-sm mt-3">
                    {format(new Date(review.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                {/* Clear float for mobile */}
                <div className="clear-both md:hidden"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
