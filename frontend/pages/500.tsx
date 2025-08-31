import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Custom500: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Head>
        <title>500 - Server-side error occurred</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Server-side error occurred</h2>
        <p className="text-gray-600 mb-6">
          Sorry, something went wrong on our end. Please try again later.
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default Custom500;
