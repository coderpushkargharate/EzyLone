'use client';

import { useState } from 'react';
import TrafficPanel from './sa/TrafficPanel';
import Ga4Panel from './sa/Ga4Panel';
import SearchConsolePanel from './sa/SearchConsolePanel';

// "SEO & Traffic" admin tab (same layout as the Mappingg super-admin SEO tab):
// first-party visitor analytics, Google Analytics 4 and Google Search Console.
// The panels use Font Awesome icon classes, loaded here only for the admin.

type View = 'all' | 'traffic' | 'ga4' | 'gsc';
const VIEWS: [View, string][] = [['all', 'Everything'], ['traffic', 'Website traffic'], ['ga4', 'Google Analytics'], ['gsc', 'Search Console']];

export default function SeoTrafficPanel() {
  const [view, setView] = useState<View>('all');
  return (
    <div className="viz">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <div className="viz-toggle" role="tablist" aria-label="Section" style={{ alignSelf: 'flex-start' }}>
        {VIEWS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}
      </div>
      {(view === 'all' || view === 'traffic') && <TrafficPanel />}
      {(view === 'all' || view === 'ga4') && <Ga4Panel />}
      {(view === 'all' || view === 'gsc') && <SearchConsolePanel />}
    </div>
  );
}
