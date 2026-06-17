import React from 'react';
import './index.css';

import NoiseOverlay from './components/NoiseOverlay';
import Cursor from './components/Cursor';
import HudNav from './components/HudNav';
import ThreeHero from './components/ThreeHero';
import Hero from './components/Hero';
import Journey from './components/Journey';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Connect from './components/Connect';
import Message from './components/Message';
import { ScrollProvider } from './hooks/ScrollContext';

export default function App() {
  return (
    <ScrollProvider>
      <div id="flash-overlay"></div>
      
      <Cursor />
      <NoiseOverlay />
      <HudNav />
      
      {/* 
        This is the fixed viewport where all the 3D and UI happens.
        It does not scroll natively.
      */}
      <div className="fixed-viewport">
        <ThreeHero />
        <Hero />
        <Journey />
        <TechStack />
        <Projects />
        <Connect />
        <Message />
      </div>

      {/* 
        This is a dummy tall container that forces the browser to have a scrollbar.
        The user scrolls this, and our ScrollProvider calculates the progress.
      */}
      <div className="scroll-dummy"></div>
    </ScrollProvider>
  );
}
