"use client"

import { useState } from "react"
import Link from "next/link"
import { Diamond, Coins, Shield, ArrowRight, Menu, X } from "lucide-react"
import DiamondAnimation from "./components/DiamondAnimation"
import Image from "next/image"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">CaratChain</h1>
          <nav className="hidden sm:block">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 mr-4">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Get Started
            </Link>
          </nav>
          <button
            className="sm:hidden text-blue-600 focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMenuOpen && (
          <nav className="mt-4 sm:hidden flex flex-col items-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 mb-2 py-2">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full text-center"
            >
              Get Started
            </Link>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tokenize Diamonds on the Blockchain
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              CaratChain revolutionizes diamond investment by allowing you to tokenize and trade diamond assets securely
              and transparently.
            </p>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 inline-flex items-center justify-center w-full sm:w-auto"
            >
              Start Investing Now
              <ArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <DiamondAnimation />
          </div>
        </div>

        <section className="mt-16 sm:mt-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Why Choose CaratChain?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Diamond className="w-12 h-12 text-blue-600" />}
              title="Tokenized Diamonds"
              description="Invest in fractional ownership of high-quality diamonds through blockchain technology."
            />
            <FeatureCard
              icon={<Coins className="w-12 h-12 text-blue-600" />}
              title="Liquid Assets"
              description="Trade your diamond tokens easily, making your investment more liquid than traditional diamond ownership."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-blue-600" />}
              title="Secure & Transparent"
              description="Benefit from the security and transparency of blockchain technology in your diamond investments."
            />
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Register"
              description="Sign up as an investor, issuer, or agent on our platform."
            />
            <StepCard number="2" title="Verify" description="Complete the KYC/KYB process for your account." />
            <StepCard
              number="3"
              title="Tokenize or Invest"
              description="Issuers can tokenize diamonds, while investors can purchase tokens."
            />
            <StepCard
              number="4"
              title="Trade"
              description="Buy, sell, or hold your diamond tokens on our secure platform."
            />
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:flex-shrink-0">
                <Image
                  className="h-48 w-full object-cover md:w-48"
                  src="https://i.ibb.co/ds3Hv53n/fef729ae-e5b8-4340-835a-ef18ebadae70.jpg"
                  alt="Diamond Investment"
                  width={192}
                  height={192}
                />
              </div>
              <div className="p-6 sm:p-8">
                <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">Featured</div>
                <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">
                  Revolutionizing Diamond Investment
                </h3>
                <p className="mt-2 text-gray-600">
                  Learn how CaratChain is changing the way people invest in diamonds through blockchain technology and
                  tokenization.
                </p>
                <Link href="/learn-more" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                  Learn More &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue-600 text-white py-6 sm:py-8 mt-16 sm:mt-24">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} CaratChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
      <div className="flex justify-center mb-4">
        <span className="text-3xl font-bold text-blue-600">{number}</span>
      </div>
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

