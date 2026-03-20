import { PublicNavbar } from '@/components/layouts/public-navbar';
import { PublicFooter } from '@/components/layouts/public-footer';
import { HeroSection } from '@/components/home/hero-section';
import { HowItWorks } from '@/components/home/how-it-works';
import { CampaignsPreview } from '@/components/home/campaigns-preview';
import { MapPreview } from '@/components/home/map-preview';
import { KeyFigures } from '@/components/home/key-figures';
import { WhoIsItFor } from '@/components/home/who-is-it-for';
import { CtaSection } from '@/components/home/cta-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background" style={{ overflowX: 'hidden' }}>
      <PublicNavbar />
      <HeroSection />
      <HowItWorks />
      <CampaignsPreview />
      <MapPreview />
      <KeyFigures />
      <WhoIsItFor />
      <CtaSection />
      <PublicFooter />
    </div>
  );
}
