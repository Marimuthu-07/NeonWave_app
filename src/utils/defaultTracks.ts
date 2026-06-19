import { Track } from '../types';

export const DefaultTracks: Track[] = [
  {
    id: 'synth-loop',
    title: 'Neon Wave Horizon',
    artist: 'NEONWAVE Engine',
    album: 'Zero Ingress Synthesis',
    duration: 300,
    url: 'synthwave://procedural',
    coverUrl: 'synthwave',  // Key flag for rendering procedural graphics
    format: 'SYNTH',
    sampleRate: '96.0 kHz',
    bitDepth: '32-bit Float',
    bitrate: '3072 kbps',
    size: 'Procedural Feed'
  },
  {
    id: 'retro-grid',
    title: 'Cyberpunk Grid Runner',
    artist: 'Synthwave Electro',
    album: 'Retro Outrun',
    duration: 372,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    format: 'MP3',
    sampleRate: '44.1 kHz',
    bitDepth: '16-bit',
    bitrate: '320 kbps',
    size: '14.2 MB'
  },
  {
    id: 'arcade-shift',
    title: 'Midnight Arcade Shift',
    artist: 'Vapor Outlaw',
    album: 'Neon Grid Arcade',
    duration: 423,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    format: 'MP3',
    sampleRate: '44.1 kHz',
    bitDepth: '16-bit',
    bitrate: '320 kbps',
    size: '16.1 MB'
  },
  {
    id: 'neon-sunset',
    title: 'Neon Drive Sunset',
    artist: 'Horizon Drifter',
    album: 'Endless Highways',
    duration: 302,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
    format: 'MP3',
    sampleRate: '44.1 kHz',
    bitDepth: '16-bit',
    bitrate: '320 kbps',
    size: '11.5 MB'
  }
];
