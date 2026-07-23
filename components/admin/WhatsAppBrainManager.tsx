'use client';
import React from 'react';
import EzyBrainManager from './EzyBrainManager';

// The "WhatsApp AI Brain" admin section — same manager as Ezy AI Brain, scoped to
// the WhatsApp channel. New entries default to WhatsApp-only auto-replies, and the
// Needs-Training tab shows WhatsApp questions. Shared ('both') entries also appear.
export default function WhatsAppBrainManager() {
  return <EzyBrainManager scope="whatsapp" />;
}
