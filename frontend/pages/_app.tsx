import type { AppProps } from 'next/app';
import '../styles/globals.css';

// Force Tailwind to include these classes
const forceTailwindClasses = [
  // Layout
  'min-h-screen', 'flex', 'flex-col', 'items-center', 'justify-center',
  // Typography
  'text-4xl', 'font-bold', 'text-center', 'text-gray-800',
  // Buttons
  'px-4', 'py-2', 'rounded-full', 'bg-blue-500', 'text-white', 'hover:bg-blue-600',
  // Inputs
  'border', 'border-gray-300', 'rounded-lg', 'px-4', 'py-2', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500',
  // Cards
  'bg-white', 'shadow-md', 'rounded-xl', 'p-6', 'w-full', 'max-w-2xl',
  // Utils
  'mt-4', 'mb-4', 'mx-auto'
];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
