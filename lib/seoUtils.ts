import { Metadata } from 'next';
import { resolveImageUrl } from '@/lib/imageUtils';

// Define SEO keywords by category
export const SEO_KEYWORDS = {
  // Primary destination keywords
  destinations: [
    'Cameron Highlands',
    'Mossy Forest Brinchang',
    'Gunung Brinchang viewpoint',
    'BOH Tea Plantation',
    'Taman Negara',
    'Kuala Besut',
    'Perhentian Islands',
    'Kuala Lumpur'
  ],

  // Tour-specific keywords
  tours: [
    // Core Mossy Forest keywords
    'Mossy Forest tours',
    'Mossy Forest tour Cameron Highlands',
    'Cameron Highlands Mossy Forest tour',
    'Half day Mossy Forest tour',
    'Full day Cameron Highlands tours',
    'Guided Mossy Forest tour',
    'Cameron Highlands sightseeing tour',
    
    // Best/booking keywords
    'Best Mossy Forest tours',
    'Affordable Cameron Highlands tours',
    'Private Cameron Highlands tours',
    'Small group Mossy Forest tour',
    'Cameron Highlands tour package',
    'Book Mossy Forest tour',
    
    // Experience-based keywords
    'Mossy Forest boardwalk tour',
    'Mossy Forest nature tour',
    'Cameron Highlands nature tour',
    'Tea plantation and Mossy Forest tour',
    'Cameron Highlands eco tour',
    
    // Local SEO variations
    'Mossy Forest tour Brinchang',
    'Mossy Forest tour Tanah Rata',
    'Cameron Highlands tours from Brinchang',
    'Cameron Highlands tours from Tanah Rata',
    
    // Additional variations
    'Mossy Forest Cameron Highlands',
    'Cameron Highlands Mossy Forest',
    'Mossy Forest hiking',
    'Mossy Forest trekking',
    'Mossy Forest half-day tour',
    'Mossy Forest full-day tour',
    'Mossy Forest eco tour',
    'Mossy Forest tour price',
    'Mossy Forest with guide',
    'Mossy Forest taxi service',
    'Land Rover ride Mossy Forest',
    'Mossy Forest walk Cameron Highlands',
    'Mossy Forest jungle trekking',
    'Mossy Forest nature trail',
    'Mossy Forest adventure tour',
    'Mossy Forest misty weather',
    'Mossy Forest Instagram spots',
    'Mossy Forest photography tour',
    'Sunrise Cameron Highlands tour',
    'Cameron Highlands sunrise tour',
    'Sunrise viewpoint Cameron Highlands tour',
    'Best sunrise tour Cameron Highlands',
    'Sunrise and Mossy Forest tour Cameron Highlands',
    'Sunrise tea plantation tour Cameron Highlands',
    'Sunrise hiking tour Cameron Highlands',
    'Private sunrise tour Cameron Highlands',
    'Sunrise photography tour Cameron Highlands',
    'Cameron Highlands sunrise package',
    'Cameron Highlands sightseeing',
    'Cameron Highlands jungle walk',
    'Cameron Highlands adventure trip',
    'Half day land rover tour Cameron Highlands',
    'Private tour Cameron Highlands',
    'Co-tour Cameron Highlands',
    'Budget tour',
    'Family tour',
    'Adventure tours Cameron Highlands',
    'Half day tours Cameron Highlands'
  ],

  // Transfer-specific keywords  
  transfers: [
    // Priority route keywords (most searched) - UPDATED WITH ALL VARIATIONS
    // Cameron Highlands to Taman Negara
    'Bus from Cameron Highlands to Taman Negara',
    'Transfer from Cameron Highlands to Taman Negara',
    'Cameron Highlands to Taman Negara bus',
    'Cameron Highlands to Taman Negara transfer',
    'Cameron Highlands Taman Negara transport',
    'Van from Cameron Highlands to Taman Negara',
    'Minivan Cameron Highlands to Taman Negara',

    // Taman Negara to Cameron Highlands (reverse)
    'Bus from Taman Negara to Cameron Highlands',
    'Transfer from Taman Negara to Cameron Highlands',
    'Taman Negara to Cameron Highlands bus',
    'Taman Negara to Cameron Highlands transfer',
    'Taman Negara Cameron Highlands transport',
    'Van from Taman Negara to Cameron Highlands',

    // Kuala Besut to Cameron Highlands
    'Bus from Kuala Besut Jetty to Cameron Highlands',
    'Transfer from Kuala Besut Jetty to Cameron Highlands',
    'Kuala Besut to Cameron Highlands bus',
    'Kuala Besut to Cameron Highlands transfer',
    'Kuala Besut Cameron Highlands transport',
    'Van from Kuala Besut to Cameron Highlands',
    'Kuala Besut jetty transfer',

    // Cameron Highlands to Perhentian Islands
    'Cameron Highlands to Perhentian Islands transfer',
    'Cameron Highlands to Perhentian Islands bus',
    'Cameron Highlands Perhentian Islands transport',
    'How to get from Cameron Highlands to Perhentian',
    'Cameron Highlands to Perhentian ferry',
    'Van and ferry Cameron Highlands to Perhentian',
    'Transfer from Cameron Highlands to Perhentian',

    // Cameron Highlands to Kuala Besut (for Perhentian connection)
    'Cameron Highlands to Kuala Besut transfer',
    'Cameron Highlands to Kuala Besut bus',
    'Cameron Highlands to Kuala Besut jetty',

    // Core transfer services
    'Cameron Highlands transfer service',
    'Minivan transfer Cameron Highlands to Kuala Besut',
    'Taman Negara to Perhentian Islands transfer',
    'Kuala Tahan minivan transfer',
    'Cameron Highlands to Perhentian Islands transfer',
    'Perhentian Islands boat ticket + minivan',
    'Van transfer Cameron Highlands',
    'Private van Cameron Highlands',
    'Boat + van transfer Cameron Highlands',
    'Van ticket Cameron Highlands',
    'Taman Negara transfer van Cameron Highlands',
    'Kuala Besut jetty van transfer',
    'Private tour from Kuala Lumpur to Cameron Highlands',

    // Popular routes and destinations
    'Cameron Highlands to Kuala Lumpur transfer',
    'Cameron Highlands to KLIA airport transfer',
    'Cameron Highlands to KL Sentral transfer',
    'Tanah Rata to Kuala Lumpur van',
    'Brinchang to KL transfer service',
    'Cameron Highlands to Georgetown Penang transfer',
    'Cameron Highlands to Ipoh transfer',
    'Cameron Highlands to Malacca transfer',
    'Cameron Highlands to Genting Highlands transfer',
    'Cameron Highlands to Cherating transfer',
    'Cameron Highlands to Kuantan transfer',
    'Cameron Highlands shuttle service',

    // Transport types and features
    'air conditioned van Cameron Highlands',
    'comfortable minivan transfer',
    'door to door transfer Cameron Highlands',
    'hotel pickup transfer Cameron Highlands',
    'shared van transfer Malaysia',
    'express transfer Cameron Highlands',
    'budget transfer Cameron Highlands',
    'reliable transfer service Malaysia',
    'safe transfer Cameron Highlands',
    'licensed transfer operator',
    'experienced driver transfer',
    'luggage included transfer',

    // Ferry combinations
    'Cameron Highlands Perhentian ferry combo',
    'mainland to island transfer package',
    'Kuala Besut jetty ferry service',
    'Perhentian fast boat booking',
    'island hopping transfer',
    'ferry schedule Cameron Highlands',

    // Booking and convenience
    'online van booking Cameron Highlands',
    'instant confirmation transfer',
    'flexible transfer booking',
    'last minute transfer Cameron Highlands',
    'group transfer Cameron Highlands',
    'family transfer service',
    'backpacker transfer Cameron Highlands',
    'tourist transfer Malaysia'
  ],

  // Service-related keywords
  services: [
    'Tours and transfers Cameron Highlands',
    'Budget tours Cameron Highlands',
    'Friendly tour',
    'Sharing trip',
    'Private trip',
    'Family trip',
    'Vacation',
    'Intimate group adventure tour Cameron Highlands',
    'Pick up from hostel tour Cameron Highlands'
  ],

  // Visitor info keywords
  visitorInfo: [
    'Mossy Forest parking',
    'Mossy Forest travel tips',
    'Mossy Forest weather forecast',
    'Mossy Forest safety tips',
    'Mossy Forest what to wear',
    'Mossy Forest best season',
    'Mossy Forest entrance Cameron Highlands',
    'Mossy Forest location',
    'Mossy Forest Cameron Highlands map'
  ],

  // Price/booking related
  pricing: [
    'Mossy Forest entrance fee',
    'Mossy Forest ticket price',
    'Mossy Forest Cameron Highlands fees',
    'Mossy Forest admission cost',
    'Book private van transfer Cameron Highlands online',
    'Cheap private tour Cameron Highlands',
    'Shared co-tour vs private tour cost Cameron Highlands'
  ]
};

// Social media and contact information
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/mossyforesttours',
  whatsapp: 'http://wa.me/60196592141'
};

// Website constants
export const SITE_CONFIG = {
  name: 'Mossy Forest Tours',
  title: 'Mossy Forest Tours - Cameron Highlands Mossy Forest & Nature Tours',
  description: 'Discover the magical Mossy Forest with expert-guided tours in Cameron Highlands. Book Mossy Forest tours, sunrise tours, tea plantation visits, and eco tours. Small groups, affordable prices, unforgettable experiences.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mossyforest.my',
  author: 'Mossy Forest Tours Team',
  keywords: [
    'Mossy Forest tours',
    'Cameron Highlands tours',
    'Mossy Forest tour Cameron Highlands',
    'Cameron Highlands Mossy Forest tour',
    'Half day Mossy Forest tour',
    'Guided Mossy Forest tour',
    'Best Mossy Forest tours',
    'Book Mossy Forest tour',
    'Mossy Forest boardwalk tour',
    'Cameron Highlands nature tour',
    'Tea plantation and Mossy Forest tour',
    ...SEO_KEYWORDS.tours.slice(0, 10),
    ...SEO_KEYWORDS.transfers.slice(0, 5),
  ]
};

// Helper function to strip HTML tags for meta descriptions
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to truncate text to specific length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Generate keywords array for specific content
export function generateKeywords(
  baseKeywords: string[] = [],
  contentType: 'tour' | 'transfer' | 'general' | 'blog' = 'general',
  location?: string
): string[] {
  const keywords = [...baseKeywords, ...SITE_CONFIG.keywords];

  // Add content-specific keywords
  if (contentType === 'tour') {
    keywords.push(...SEO_KEYWORDS.tours.slice(0, 20), ...SEO_KEYWORDS.visitorInfo.slice(0, 5));
  } else if (contentType === 'transfer') {
    keywords.push(...SEO_KEYWORDS.transfers.slice(0, 15));
  } else if (contentType === 'blog') {
    keywords.push(...SEO_KEYWORDS.tours.slice(0, 10), ...SEO_KEYWORDS.visitorInfo.slice(0, 5));
  }

  // Add location-specific keywords if provided
  if (location) {
    keywords.push(`${location} tour`, `${location} transfer`, `visit ${location}`);
  }

  // Remove duplicates and limit to 30 keywords max
  return [...new Set(keywords)].slice(0, 30);
}

// Generate structured data for tours
export function generateTourStructuredData(tour: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TourPackage',
    name: tour.title,
    description: stripHtmlTags(tour.description || tour.desc),
    image: tour.image,
    offers: {
      '@type': 'Offer',
      price: tour.newPrice,
      priceCurrency: 'MYR',
      availability: tour.status === 'active' ? 'InStock' : 'OutOfStock'
    },
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url
    },
    duration: `PT${tour.duration}H`,
    touristType: tour.type === 'private' ? 'Private' : 'Group'
  };
}

// Generate structured data for transfers
export function generateTransferStructuredData(transfer: any) {
  const baseStructuredData: any = {
    '@context': 'https://schema.org',
    '@type': ['TravelService', 'Service', 'BusTrip'],
    name: transfer.title,
    alternateName: [
      `Bus from ${transfer.from} to ${transfer.to}`,
      `Transfer from ${transfer.from} to ${transfer.to}`,
      `${transfer.from} to ${transfer.to} bus`,
      `${transfer.from} to ${transfer.to} transfer`,
    ],
    description: stripHtmlTags(transfer.description || transfer.desc),
    image: transfer.image ? resolveImageUrl(transfer.image) : `${SITE_CONFIG.url}/images/og-default.jpg`,
    serviceType: 'Transportation Service',
    category: transfer.type === 'Private' ? 'Private Transfer' :
      transfer.type === 'Van + Ferry' ? 'Combined Transport' : 'Shared Transfer',
    keywords: [
      `bus ${transfer.from} ${transfer.to}`,
      `transfer ${transfer.from} ${transfer.to}`,
      `van ${transfer.from} ${transfer.to}`,
      'Cameron Highlands transport',
      'Taman Negara bus',
      'Kuala Besut transfer',
    ].join(', '),
    offers: {
      '@type': 'Offer',
      price: transfer.newPrice,
      priceCurrency: 'MYR',
      availability: transfer.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url
      }
    },
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      telephone: '+60196592141',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cameron Highlands',
        addressRegion: 'Pahang',
        addressCountry: 'MY'
      }
    },
    areaServed: [
      {
        '@type': 'Place',
        name: transfer.from
      },
      {
        '@type': 'Place',
        name: transfer.to
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Transfer Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: transfer.title,
            description: stripHtmlTags(transfer.description || transfer.desc)
          }
        }
      ]
    }
  };

  // Add specific properties based on transfer type
  if (transfer.type === 'Van + Ferry') {
    baseStructuredData.additionalType = 'https://schema.org/TouristTrip';
    baseStructuredData.includedInDataCatalog = {
      '@type': 'DataCatalog',
      name: 'Ferry and Van Services',
      description: 'Combined transportation services including ferry transfers'
    };
  }

  if (transfer.maximumPerson || transfer.seatCapacity) {
    baseStructuredData.maximumAttendeeCapacity = transfer.maximumPerson || transfer.seatCapacity;
  }

  if (transfer.minimumPerson) {
    baseStructuredData.minimumAttendeeCapacity = transfer.minimumPerson;
  }

  return baseStructuredData;
}

// Generate Open Graph metadata
export function generateOpenGraph(
  title: string,
  description: string,
  image?: string,
  url?: string
) {
  return {
    title,
    description: truncateText(description, 160),
    url: url || SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: image || '/images/default-og-image.jpg', // Add a default OG image
        width: 1200,
        height: 630,
        alt: title
      }
    ],
    locale: 'en_US',
    type: 'website'
  };
}

// Generate Twitter Card metadata
export function generateTwitterCard(
  title: string,
  description: string,
  image?: string
) {
  return {
    card: 'summary_large_image',
    title: truncateText(title, 70),
    description: truncateText(description, 160),
    images: [image || '/images/default-og-image.jpg'],
    creator: '@mossyforesttours'
  };
}

// Main function to generate complete metadata for tours
export function generateTourMetadata(tour: any): Metadata {
  // Extract destination from title or tags
  const destination = extractDestination(tour.title, tour.tags) || 'Cameron Highlands';

  const title = `${tour.title} | ${tour.type === 'private' ? 'Private' : 'Shared'} Tour in ${destination} - Mossy Forest Tours`;
  const description = truncateText(
    stripHtmlTags(tour.description || tour.desc || `Explore ${destination} with our ${tour.type} tour. ${tour.title} - Book now for an unforgettable adventure.`),
    160
  );

  const keywords = generateKeywords(
    [tour.title, ...(tour.tags || [])],
    'tour',
    destination
  );

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: generateOpenGraph(title, description, tour.image),
    twitter: generateTwitterCard(title, description, tour.image),
    alternates: {
      canonical: `${SITE_CONFIG.url}/tours/${tour.slug}`
    },
    other: {
      'structured-data': JSON.stringify(generateTourStructuredData(tour))
    }
  };
}

// Helper function to extract destination from title and tags
function extractDestination(title: string, tags: string[] = []): string | null {
  const allText = [title, ...tags].join(' ').toLowerCase();

  const destinations = [
    'cameron highlands',
    'taman negara',
    'kuala besut',
    'perhentian islands',
    'kuala lumpur',
    'pahang',
    'mossy forest'
  ];

  for (const dest of destinations) {
    if (allText.includes(dest)) {
      // Return properly capitalized destination
      return dest.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  return null;
}

// Main function to generate complete metadata for transfers
export function generateTransferMetadata(transfer: any): Metadata {
  // Create more descriptive title based on transfer type and route
  const transferType = transfer.type === 'Private' ? 'Private' :
    transfer.type === 'Van + Ferry' ? 'Van + Ferry' : 'Shared Van';

  // Generate search-optimized title variations
  const routeVariations = [
    `Bus from ${transfer.from} to ${transfer.to}`,
    `Transfer from ${transfer.from} to ${transfer.to}`,
    `${transfer.from} to ${transfer.to} bus`,
    `${transfer.from} to ${transfer.to} transfer`,
  ];

  const title = `${transfer.title} | ${transferType} Transfer from ${transfer.from} to ${transfer.to} - Mossy Forest Tours`;

  // Enhanced description with route details and benefits
  const baseDescription = stripHtmlTags(transfer.description || transfer.desc || '');
  const routeInfo = `Comfortable ${transferType.toLowerCase()} transfer from ${transfer.from} to ${transfer.to}`;
  const features = transfer.type === 'Private' ?
    'Private vehicle, flexible timing, door-to-door service' :
    transfer.type === 'Van + Ferry' ?
      'Combined van and ferry service, seamless island connection' :
      'Shared van service, budget-friendly, reliable schedule';

  const description = baseDescription ||
    `${routeInfo}. ${features}. Book your Cameron Highlands transfer with Mossy Forest Tours for a safe and comfortable journey.`;

  // Enhanced keywords based on route and type - NOW INCLUDING HIGH-PRIORITY SEARCH TERMS
  const routeKeywords = [
    ...routeVariations, // Include all search variations
    `${transfer.from} to ${transfer.to} van`,
    `${transfer.from} ${transfer.to} minivan`,
    `transport from ${transfer.from}`,
    `${transfer.to} transfer service`,
    `${transfer.from} transport`,
    `${transfer.to} shuttle`,
    `${transfer.from} ${transfer.to} taxi`,
    `${transfer.from} ${transfer.to} shuttle service`,
  ];

  const typeKeywords = transfer.type === 'Private' ?
    ['private transfer', 'private van', 'door to door transfer', 'flexible transfer', 'private minivan'] :
    transfer.type === 'Van + Ferry' ?
      ['ferry transfer', 'island transfer', 'boat van combo', 'ferry van package', 'van ferry service', 'combined transport'] :
      ['shared van', 'budget transfer', 'economy transfer', 'group transfer', 'shared minivan'];

  const keywords = generateKeywords(
    [transfer.title, ...routeKeywords, ...typeKeywords, ...(transfer.tags || [])],
    'transfer',
    `${transfer.from} ${transfer.to}`
  );

  return {
    title: truncateText(title, 60),
    description: truncateText(description, 160),
    keywords: keywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: generateOpenGraph(title, description, transfer.image),
    twitter: generateTwitterCard(title, description, transfer.image),
    alternates: {
      canonical: `${SITE_CONFIG.url}/transfers/${transfer.slug}`
    },
    other: {
      'structured-data': JSON.stringify(generateTransferStructuredData(transfer))
    }
  };
}

// Generate metadata for general pages
export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  keywords: string[] = []
): Metadata {
  const fullTitle = `${title} - ${SITE_CONFIG.name}`;
  const metaKeywords = generateKeywords(keywords, 'general');

  return {
    title: fullTitle,
    description: truncateText(description, 160),
    keywords: metaKeywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: generateOpenGraph(fullTitle, description),
    twitter: generateTwitterCard(fullTitle, description),
    alternates: {
      canonical: `${SITE_CONFIG.url}${path}`
    }
  };
}

// Main function to generate complete metadata for blogs
export function generateBlogMetadata(blog: any): Metadata {
  const title = `${blog.title} | ${blog.category} Blog - Mossy Forest Tours`;
  const description = truncateText(
    stripHtmlTags(blog.description || blog.content || `Read about ${blog.title} on Mossy Forest Tours blog. Discover travel tips, destination guides, and more.`),
    160
  );

  const keywords = generateKeywords(
    [blog.title, blog.category, ...(blog.tags || [])],
    'blog',
    'Cameron Highlands travel'
  );

  // Format publish date for structured data
  const publishDate = blog.publishDate || blog.createdAt;
  const isoDate = publishDate ? new Date(publishDate).toISOString() : new Date().toISOString();

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: {
      ...generateOpenGraph(title, description, blog.image),
      type: 'article',
      publishedTime: isoDate,
      section: blog.category,
      tags: blog.tags || [blog.category]
    },
    twitter: generateTwitterCard(title, description, blog.image),
    alternates: {
      canonical: `${SITE_CONFIG.url}/blogs/${blog.slug}`
    },
    other: {
      'structured-data': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: description,
        image: blog.image ? resolveImageUrl(blog.image) : `${SITE_CONFIG.url}/images/og-default.jpg`,
        author: {
          '@type': 'Organization',
          name: SITE_CONFIG.author
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.author,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.url}/images/logo.png`
          }
        },
        datePublished: isoDate,
        dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : isoDate,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_CONFIG.url}/blogs/${blog.slug}`
        },
        articleSection: blog.category,
        wordCount: stripHtmlTags(blog.content || '').split(' ').length
      })
    }
  };
}