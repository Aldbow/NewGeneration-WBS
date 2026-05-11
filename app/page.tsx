import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import FeatureGrid from '@/components/landing/FeatureGrid'

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <FeatureGrid />
      </main>
      <Footer />
    </>
  )
}
