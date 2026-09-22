/* EzySaathi AI — conversation test suite (pure, no DB).
 *
 * Exercises the context-aware intent classifier that drives post-lead Q&A. Run:
 *   npx tsc --module commonjs --target es2019 --esModuleInterop --moduleResolution node \
 *     --outDir .tmp-test lib/chatbot/knowledge.ts lib/chatbot/answers.ts \
 *     lib/chatbot/intent.ts scripts/test-ezysaathi.ts
 *   node .tmp-test/scripts/test-ezysaathi.js
 *
 * (A convenience wrapper lives in scripts/run-ezysaathi-tests.mjs.)
 */

import { classifyIntent, ConvContext, Intent, parseCallbackTime } from '../lib/chatbot/intent';
import { clarificationAnswer, altClarificationAnswer } from '../lib/chatbot/answers';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    passed++;
    // eslint-disable-next-line no-console
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ' — ' + detail : ''}`);
    // eslint-disable-next-line no-console
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

interface Case {
  name: string;
  message: string;
  ctx?: ConvContext;
  intent?: Intent | Intent[];
  includes?: string[]; // reply must contain ALL of these (case-insensitive)
  excludes?: string[]; // reply must contain NONE of these
  action?: string;
  callbackTime?: string;
}

const LAP: ConvContext = { loanType: 'Loan Against Property', leadName: 'Chandan', leadPhone: '9777228844' };

const cases: Case[] = [
  // TEST 3 — documents (product-aware: LAP)
  { name: 'T3 documents (LAP)', message: 'What documents needed?', ctx: LAP, intent: 'DOCUMENTS', includes: ['Property ownership documents'] },

  // TEST 4 — property not in my name
  { name: 'T4 property not in my name', message: 'Property not in my name', ctx: LAP, intent: 'PROPERTY_OWNERSHIP', includes: ['co-applicant'], excludes: ['guaranteed', 'approved'] },

  // TEST 5 — callback time after "what time" prompt
  {
    name: 'T5 callback time (with prompt context)',
    message: 'Tomorrow 11am',
    ctx: { ...LAP, previousAssistant: 'What time would you like a specialist to call?' },
    intent: 'CALLBACK_TIME',
    action: 'SET_CALLBACK_TIME',
    callbackTime: 'Tomorrow at 11:00 AM',
  },

  // TEST 6 — confirm appointment (context exists)
  {
    name: 'T6 fix appointment (confirm, context)',
    message: 'Fix appointment',
    ctx: { ...LAP, callbackRequested: true, preferredCallbackTime: 'Tomorrow at 11:00 AM' },
    intent: 'CONFIRM_APPOINTMENT',
    includes: ['All set'],
  },
  { name: 'T6b fix appointment (fresh → ask time)', message: 'Fix appointment', ctx: LAP, intent: 'APPOINTMENT_REQUEST', action: 'ASK_CALLBACK_TIME' },

  // TEST 7 — repetition complaint
  { name: 'T7 repetition complaint', message: 'Why you are sending same messages repeatedly', ctx: LAP, intent: 'REPEAT_MESSAGE_COMPLAINT', includes: ['repeated'] },

  // TEST 8 — are you human
  { name: 'T8 are you human', message: 'Are you human?', ctx: LAP, intent: 'ARE_YOU_HUMAN', includes: ['EzySaathi AI'], excludes: ['I am human'] },

  // TEST 9 — EMI for 10 lakh (needs rate + tenure)
  { name: 'T9 EMI for 10 lakh', message: 'What is EMI for 10 lakh?', ctx: LAP, intent: 'EMI_CALCULATION', includes: ['interest rate', 'tenure'] },

  // TEST 10 — interest rate
  { name: 'T10 interest rate', message: 'What is interest rate?', ctx: LAP, intent: 'INTEREST_RATE', includes: ['8.99'] },

  // TEST 11 — low CIBIL
  { name: 'T11 low CIBIL', message: 'Can I get loan if CIBIL is low?', ctx: LAP, intent: 'CIBIL', excludes: ['guaranteed'] },

  // TEST 12 — father's property
  { name: "T12 father's property", message: "Can I get loan against my father's property?", ctx: LAP, intent: 'PROPERTY_OWNERSHIP', excludes: ['guaranteed approval'] },

  // TEST 13 — call me
  { name: 'T13 call me', message: 'Call me', ctx: LAP, intent: 'CALLBACK_REQUEST', action: 'ASK_CALLBACK_TIME' },

  // TEST 14 — Monday 3pm (callback time from a lone time expression)
  { name: 'T14 Monday 3pm', message: 'Monday 3pm', ctx: { ...LAP, callbackRequested: true }, intent: 'CALLBACK_TIME', callbackTime: 'Monday at 3:00 PM' },

  // TEST 15 — thank you
  { name: 'T15 thank you', message: 'Thank you', ctx: LAP, intent: 'THANK_YOU' },

  // TEST 16 — contact info
  { name: 'T16 phone number', message: 'What is your phone number?', ctx: LAP, intent: 'CONTACT_INFORMATION', includes: ['6372977626'] },

  // TEST 17 — unrelated
  { name: 'T17 cricket', message: 'Tell me something about cricket', ctx: LAP, intent: 'UNRELATED_QUESTION', includes: ['specialise in loans'] },

  // TEST 18 — how much can I get (LAP → product cap)
  { name: 'T18 how much (LAP)', message: 'How much can I get?', ctx: LAP, intent: 'LOAN_AMOUNT', includes: ['3 Crore'] },
  { name: 'T18b how much (no product) → clarify', message: 'How much?', ctx: {}, intent: 'CLARIFICATION', includes: ['maximum loan amount'] },

  // Extra follow-up questions from the brief
  { name: 'X used car loan', message: 'Can I get used car loan?', ctx: {}, intent: 'LOAN_PRODUCT_INFO', includes: ['Used Car'] },
  { name: 'X transfer existing car loan', message: 'Can I transfer my existing car loan?', ctx: {}, intent: 'BALANCE_TRANSFER' },
  { name: 'X processing fee', message: 'What is processing fee?', ctx: LAP, intent: 'PROCESSING_FEE' },
  { name: 'X tenure', message: 'How many years tenure?', ctx: LAP, intent: 'TENURE' },
  { name: 'X foreclosure', message: 'Can I foreclose my loan early?', ctx: LAP, intent: 'FORECLOSURE' },
  { name: 'X eligibility no salary', message: 'Can I get loan without salary?', ctx: LAP, intent: 'INCOME_REQUIREMENT' },
  { name: 'X approval time', message: 'How long does approval take?', ctx: LAP, intent: 'APPROVAL_PROCESS' },
  { name: 'X wife property', message: 'Can I get loan if property is in my wife name?', ctx: LAP, intent: 'PROPERTY_OWNERSHIP' },
  { name: 'X talk to human', message: 'I want to talk to a human', ctx: LAP, intent: 'HUMAN_HANDOFF', action: 'ASK_CALLBACK_TIME' },
  { name: 'X callback with time inline', message: 'Please call me tomorrow evening', ctx: LAP, intent: 'CALLBACK_TIME', action: 'SET_CALLBACK_TIME', callbackTime: 'Tomorrow evening' },
];

// eslint-disable-next-line no-console
console.log('EzySaathi AI — intent classifier tests\n');

for (const c of cases) {
  const r = classifyIntent(c.message, c.ctx || {});
  const lc = r.reply.toLowerCase();
  const detail = `got intent=${r.intent} action=${r.action} time=${r.callbackTime ?? '-'}`;
  if (c.intent) {
    const list = Array.isArray(c.intent) ? c.intent : [c.intent];
    check(c.name + ' [intent]', list.includes(r.intent), detail);
  }
  if (c.action) check(c.name + ' [action]', r.action === c.action, detail);
  if (c.callbackTime) check(c.name + ' [time]', r.callbackTime === c.callbackTime, detail);
  if (c.includes) for (const inc of c.includes) check(`${c.name} [includes "${inc}"]`, lc.includes(inc.toLowerCase()), `reply=${r.reply.slice(0, 80)}`);
  if (c.excludes) for (const ex of c.excludes) check(`${c.name} [excludes "${ex}"]`, !lc.includes(ex.toLowerCase()), `reply=${r.reply.slice(0, 80)}`);
}

// parseCallbackTime unit checks
check('time: "today evening"', parseCallbackTime('today evening') === 'Today evening');
check('time: "at 5 pm"', parseCallbackTime('at 5 pm') === '5:00 PM');
check('time: "5 lakh" is NOT a time', parseCallbackTime('5 lakh') === null);
check('time: "10" is NOT a time', parseCallbackTime('10') === null);

// Loop-protection building blocks: the two clarifications must differ.
check('loop: alt clarification differs', altClarificationAnswer() !== clarificationAnswer());

// No valid loan question should ever produce the OLD generic intro. Our
// clarification is used instead — and is only for genuinely unknown messages.
const unknown = classifyIntent('asdfghjkl qwerty', LAP);
check('unknown → clarification (not a loan answer)', unknown.intent === 'UNKNOWN');

// eslint-disable-next-line no-console
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  // eslint-disable-next-line no-console
  console.log('\nFailures:\n - ' + failures.join('\n - '));
  process.exit(1);
}
