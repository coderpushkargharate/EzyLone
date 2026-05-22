// components/SEO.tsx
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
  image?: string;
  pageType?: 'website' | 'article' | 'product' | 'financialproduct';
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  noindex?: boolean;
  noarchive?: boolean; // For sensitive financial pages
  structuredData?: Record<string, any>; // JSON-LD structured data
  language?: 'en-IN' | 'hi-IN'; // Multilingual support for India
  loanType?: string; // For financial product schema
}

export default function SEO({
  title,
  description,
  canonical,
  keywords = [],
  image = '/og-image.jpg',
  pageType = 'website',
  articlePublishedTime,
  articleModifiedTime,
  noindex = false,
  noarchive = false,
  structuredData,
  language = 'en-IN',
  loanType,
}: SEOProps) {
  // ✅ Fixed: Removed trailing spaces from all URLs
  const baseUrl = 'https://www.ezyloan.co.in';
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const fullTitle = title.includes('EzyLoan') ? title : `${title} | EzyLoan`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  // Generate robots content based on props
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    noindex ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
    noarchive ? 'noarchive' : '',
    'nosnippet' // Prevent auto-generated snippets for financial terms
  ].filter(Boolean).join(', ');

  // ✅ Financial Product Structured Data Generator
  const getFinancialProductSchema = () => {
    if (!loanType) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": `${loanType} - EzyLoan`,
      "description": description,
      "provider": {
        "@type": "FinancialService",
        "name": "EzyLoan (Dibyansh Associates)",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.webp`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-6372977626",
          "contactType": "Customer Service",
          "email": "care@ezyloan.co.in",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur",
          "addressLocality": "Cuttack",
          "postalCode": "753011",
          "addressRegion": "Odisha",
          "addressCountry": "IN"
        }
      },
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"],
      "audience": {
        "@type": "PeopleAudience",
        "geographicArea": {
          "@type": "Country",
          "name": "India"
        }
      },
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "INR",
          "minPrice": 0,
          "price": 0,
          "description": "Free loan facilitation service. No upfront fees."
        }
      }
    };
  };

  const financialSchema = loanType ? getFinancialProductSchema() : null;
  const combinedStructuredData = structuredData || financialSchema;

  return (
    <Head>
      {/* === CORE SEO === */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* === LANGUAGE & REGION === */}
      <html lang={language} />
      <meta name="language" content={language} />
      <meta name="geo.region" content="IN-OR" />
      <meta name="geo.placename" content="Cuttack, Odisha, India" />
      <meta name="geo.position" content="20.4618;85.8812" />
      
      {/* === ROBOTS CONTROL === */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* === OPEN GRAPH === */}
      <meta property="og:type" content={pageType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="EzyLoan" />
      <meta property="og:locale" content={language} />
      <meta property="og:locale:alternate" content={language === 'en-IN' ? 'hi-IN' : 'en-IN'} />
      
      {/* OG Image with multiple sizes for better rendering */}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl.replace('http://', 'https://')} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/jpeg" />
      {/* WebP fallback for performance */}
      <meta property="og:image" content={imageUrl.replace('.jpg', '.webp')} />
      <meta property="og:image:type" content="image/webp" />
      
      {/* === TWITTER CARD === */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@ezyloan" />
      <meta name="twitter:creator" content="@ezyloan" />
      <meta name="twitter:label1" content="Service Area" />
      <meta name="twitter:data1" content="India" />
      
      {/* === ARTICLE SPECIFIC (if blog/post) === */}
      {pageType === 'article' && articlePublishedTime && (
        <>
          <meta property="article:published_time" content={articlePublishedTime} />
          {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
          {/* ✅ Fixed: Removed trailing space in Facebook URL */}
          <meta property="article:publisher" content="https://www.facebook.com/ezyloan" />
          <meta property="article:author" content="EzyLoan Editorial Team" />
          <meta property="article:section" content="Financial Services" />
          <meta property="article:tag" content={keywords.join(', ')} />
        </>
      )}
      
      {/* === FINANCIAL SERVICES SPECIFIC META === */}
      {pageType === 'financialproduct' && (
        <>
          <meta name="financial-service-type" content={loanType || 'loan-facilitation'} />
          <meta name="rbi-compliant" content="true" />
          <meta name="dsa-registration" content="Dibyansh Associates" />
          <meta property="business:contact_data:street_address" content="1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur" />
          <meta property="business:contact_data:locality" content="Cuttack" />
          <meta property="business:contact_data:region" content="Odisha" />
          <meta property="business:contact_data:postal_code" content="753011" />
          <meta property="business:contact_data:country_name" content="India" />
          <meta property="business:contact_data:phone_number" content="+91-6372977626" />
          <meta property="business:contact_data:email" content="care@ezyloan.co.in" />
        </>
      )}
      
      {/* === PREVENT DUPLICATE INDEXING === */}
      {canonicalUrl !== `${baseUrl}/` && (
        <>
          <meta name="revisit-after" content="7 days" />
          <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
          <link rel="alternate" hrefLang="hi-IN" href={canonicalUrl.replace('en', 'hi')} />
          <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        </>
      )}
      
      {/* === MOBILE & PERFORMANCE OPTIMIZATION === */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="EzyLoan" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.webp" />
      
      {/* === SECURITY & COMPATIBILITY === */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* === DNS PREFETCH & PRECONNECT FOR PERFORMANCE === */}
      {/* ✅ Fixed: Removed trailing spaces in prefetch URLs */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* === STRUCTURED DATA (JSON-LD) === */}
      {combinedStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedStructuredData) }}
        />
      )}
      
      {/* === BREADCRUMB SCHEMA (if canonical provided) === */}
      {canonical && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": baseUrl
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": title,
                  "item": canonicalUrl
                }
              ]
            })
          }}
        />
      )}
      
      {/* === FAQ SCHEMA SUPPORT === */}
      {pageType === 'article' && structuredData?.['@type'] === 'FAQPage' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}