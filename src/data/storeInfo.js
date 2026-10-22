export const STORE_INFO = {
  name: 'Dolphin Aquarium',
  tagline: 'Freshwater Specialist & Custom Rimless Tanks',
  phoneDisplay: '07845637566',
  phoneDial: 'tel:07845637566',
  whatsappNumber: '917845637566',
  address: 'No. 5 Monasakthi Valagam, Cheyur - Vandavasi Rd, Sothupakkam, Tamil Nadu 603319',
  googleMapsUrl: 'https://maps.google.com/?q=Dolphin+Aquarium+Sothupakkam',
  openHours: 'Open 7 days a week: 9:00 AM – 9:00 PM',
  announcement: {
    enabled: true,
    text: '🌊 Direct live fish transit & delivery across Sothupakkam & Chengalpattu region. Free delivery on orders over ₹1,500!',
    linkText: 'Shop Fish Now',
    linkUrl: '#livestock',
  },
  hero: {
    headline: 'Dolphin Aquarium',
    subtitle: 'Freshwater Livestock, Custom Rimless Tanks & Aquatic Equipment',
    bannerImage: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80',
    quarantineBadgeText: 'Quarantine Certified',
    ratingBadgeText: '4.9 (Live Stock)',
    highlightNotice: '100% Healthy Quarantine Assured. Direct Tank Delivery across Sothupakkam & Chengalpattu region.',
  },
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getWhatsAppProductUrl(product, selectedSize) {
  const sizeText = selectedSize ? ` (Size: ${selectedSize})` : ''
  const message = `Hello Dolphin Aquarium, I am interested in ${product.name}${sizeText}, Price: ₹${product.price}`
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`
}
