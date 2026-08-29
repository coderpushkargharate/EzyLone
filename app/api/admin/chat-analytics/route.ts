import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatLog } from '@/lib/models/ChatLog';
import { KnowledgeEntry } from '@/lib/models/KnowledgeEntry';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/chat-analytics?days=30&channel=all
// Aggregates the Ezy AI conversation log (ChatLog) into the numbers the admin
// "Ezy AI Insights" tab shows: chat volume, answered vs unanswered rate,
// voice-vs-typed usage, channel split, a daily trend, and the top questions.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();

    const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('days') || '30', 10) || 30, 1), 365);
    const channelParam = req.nextUrl.searchParams.get('channel') || 'all';
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match: Record<string, unknown> = { createdAt: { $gte: since } };
    if (channelParam === 'web' || channelParam === 'whatsapp') match.channel = channelParam;

    const [
      totals,
      byChannel,
      bySource,
      byVia,
      daily,
      topQuestions,
      topServed,
      recentUnanswered,
    ] = await Promise.all([
      // Headline totals.
      ChatLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            answered: { $sum: { $cond: ['$matched', 1, 0] } },
            unanswered: { $sum: { $cond: ['$matched', 0, 1] } },
            avgScore: { $avg: '$score' },
          },
        },
      ]),
      // Website vs WhatsApp.
      ChatLog.aggregate([
        { $match: match },
        { $group: { _id: '$channel', count: { $sum: 1 } } },
      ]),
      // Which engine answered (knowledge / engine / llm / fallback).
      ChatLog.aggregate([
        { $match: match },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      // Voice vs typed.
      ChatLog.aggregate([
        { $match: match },
        { $group: { _id: '$via', count: { $sum: 1 } } },
      ]),
      // Daily trend (chats + unanswered per day).
      ChatLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
            unanswered: { $sum: { $cond: ['$matched', 0, 1] } },
            voice: { $sum: { $cond: [{ $eq: ['$via', 'voice'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Most-asked questions (normalised lower-case).
      ChatLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $toLower: { $trim: { input: '$question' } } },
            count: { $sum: 1 },
            answered: { $sum: { $cond: ['$matched', 1, 0] } },
            sample: { $first: '$question' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      // Top knowledge entries actually served.
      KnowledgeEntry.find({}).sort({ hits: -1 }).limit(10).select('question hits category enabled').lean(),
      // A few recent unanswered questions to act on.
      ChatLog.find({ ...match, matched: false, resolved: false })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('question channel via score createdAt')
        .lean(),
    ]);

    const t = totals[0] || { total: 0, answered: 0, unanswered: 0, avgScore: 0 };
    const viaMap = Object.fromEntries(byVia.map((v: any) => [v._id || 'text', v.count]));

    return NextResponse.json({
      rangeDays: days,
      totals: {
        total: t.total,
        answered: t.answered,
        unanswered: t.unanswered,
        answerRate: t.total ? Math.round((t.answered / t.total) * 100) : 0,
        avgConfidence: Math.round((t.avgScore || 0) * 100),
      },
      voice: {
        voice: viaMap.voice || 0,
        text: viaMap.text || 0,
        voiceShare: t.total ? Math.round(((viaMap.voice || 0) / t.total) * 100) : 0,
      },
      byChannel: byChannel.map((c: any) => ({ channel: c._id || 'web', count: c.count })),
      bySource: bySource.map((s: any) => ({ source: s._id || 'fallback', count: s.count })),
      daily: daily.map((d: any) => ({ date: d._id, total: d.total, unanswered: d.unanswered, voice: d.voice })),
      topQuestions: topQuestions.map((q: any) => ({
        question: q.sample || q._id,
        count: q.count,
        answered: q.answered,
      })),
      topServed,
      recentUnanswered,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error building analytics', error: error.message }, { status: 500 });
  }
}
