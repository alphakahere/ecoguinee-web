import { CampaignList } from '@/components/campagnes/campaign-list';

export default function CampagnesPage() {
  return (
    <>
      <div className="relative overflow-hidden" style={{ minHeight: 240, background: '#0A1A10' }}>
        <div
          className="absolute pointer-events-none"
          style={{
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(45,125,70,0.18) 0%, transparent 65%)',
            top: '50%', right: '10%', transform: 'translateY(-50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-5 py-14">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#6FCF4A' }}>
            Campagnes de sensibilisation
          </p>
          <h1 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.15 }}>
            Nos Actions sur le Terrain
          </h1>
          <p className="font-mono" style={{ color: 'rgba(245,240,232,0.55)', maxWidth: '40ch' }}>
            Toutes les campagnes de sensibilisation menées sur le territoire guinéen.
          </p>
        </div>
      </div>
      <CampaignList />
    </>
  );
}
