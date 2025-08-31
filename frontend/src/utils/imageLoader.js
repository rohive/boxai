// Custom image loader that returns the original image URL
export default function imageLoader({ src, width, quality }) {
  // If it's an external URL, return as is
  if (src.startsWith('http') || src.startsWith('https')) {
    return src;
  }
  
  // For local images, prepend the base path if needed
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}${src}`;
}
