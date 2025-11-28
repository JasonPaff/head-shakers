import { DemoHeader } from './components/demo-header';

export default function HeaderDemo1Page() {
  return (
    <div className='min-h-screen bg-background'>
      <DemoHeader />
      <main className='container mx-auto p-8'>
        <h1 className='text-2xl font-bold'>Header Demo 1</h1>
        <p className='mt-2 text-muted-foreground'>Design Style: Minimalist Zen</p>
        <div className='mt-8 space-y-4'>
          <p className='text-sm text-muted-foreground'>
            This header features an ultra-clean, minimal design with maximum whitespace and subtle
            micro-animations. The layout emphasizes negative space as a design element with a centered logo
            and split navigation.
          </p>
          <div className='mt-8'>
            <h2 className='text-lg font-semibold'>Design Principles:</h2>
            <ul className='mt-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground'>
              <li>Maximum whitespace and breathing room</li>
              <li>Centered logo with symmetrical navigation</li>
              <li>Subtle micro-animations on hover</li>
              <li>Hidden menus with smooth slide-in transitions</li>
              <li>Monochromatic palette with orange accents on interaction</li>
              <li>Full-screen minimal overlay for mobile navigation</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
