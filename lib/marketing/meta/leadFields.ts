// Map a Meta Lead Ads lead (Graph API `field_data`) to CRM fields. Pure — unit-tested.

export interface MetaLeadData {
  id: string;
  created_time?: string;
  field_data?: { name: string; values?: string[] }[];
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  platform?: string;
  is_organic?: boolean;
  custom_disclaimer_responses?: { checkbox_key?: string; is_checked?: string | boolean }[];
}

export interface MappedLead {
  name: string;
  email: string;
  phone: string;
  city?: string;
  zip?: string;
  loanType?: string;
  extraNotes: string[];
  hasContact: boolean;
}

// Answers that look like identity / financial-account data are kept out of
// free-text CRM notes; they are never sent to any ad platform either way.
const SENSITIVE_KEY = /pan|aadha?ar|passport|voter|account|ifsc|card|dob|date_of_birth|birth|salary_slip|bank/i;

export function mapLeadFields(lead: MetaLeadData): MappedLead {
  const f: Record<string, string> = {};
  for (const fd of lead.field_data || []) {
    if (fd && typeof fd.name === 'string') f[fd.name.toLowerCase()] = String((fd.values || [])[0] || '').trim().slice(0, 500);
  }
  const name = (f.full_name || f.name || [f.first_name, f.last_name].filter(Boolean).join(' ')).trim().slice(0, 120);
  const email = (f.email || f.work_email || '').toLowerCase().slice(0, 254);
  const phone = (f.phone_number || f.phone || f.mobile || f.mobile_number || '').slice(0, 20);
  const city = f.city || undefined;
  const zip = f.zip_code || f.zip || f.post_code || f.postcode || f.pincode || undefined;
  const loanKey = Object.keys(f).find((k) => /loan/.test(k) && /type|product|kind|purpose|need/.test(k));
  const loanType = loanKey ? f[loanKey].slice(0, 60) : undefined;

  const known = new Set(['full_name', 'name', 'first_name', 'last_name', 'email', 'work_email', 'phone_number', 'phone', 'mobile', 'mobile_number']);
  const extraNotes: string[] = [];
  for (const [k, v] of Object.entries(f)) {
    if (known.has(k) || !v) continue;
    extraNotes.push(SENSITIVE_KEY.test(k) ? `${k}: [withheld — view in Meta Leads Center]` : `${k}: ${v}`);
  }
  return { name, email, phone, city, zip, loanType, extraNotes, hasContact: !!(name || email || phone) };
}

/** Ad-measurement consent from a Lead Ads custom disclaimer checkbox, if the admin configured its key. */
export function consentFromDisclaimer(lead: MetaLeadData, consentKey?: string): 'granted' | 'denied' | 'unknown' {
  if (!consentKey) return 'unknown';
  const r = (lead.custom_disclaimer_responses || []).find((x) => x.checkbox_key === consentKey);
  if (!r) return 'unknown';
  return r.is_checked === true || r.is_checked === '1' || r.is_checked === 'true' ? 'granted' : 'denied';
}

export const LEAD_FIELDS_FULL =
  'id,created_time,field_data,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,platform,is_organic,custom_disclaimer_responses';
export const LEAD_FIELDS_BASIC = 'id,created_time,field_data,ad_id,form_id,custom_disclaimer_responses';
