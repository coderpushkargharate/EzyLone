// CRM sync — website form submissions (Contact + Apply Now) ko EzyLoanCrm ke
// webhook par forward karta hai. Yeh purely ADDITIVE hai: website ka original
// flow (DB save + email) waise ka waisa chalta hai. CRM sync fail ho jaye
// (network down, CRM offline, secret mismatch) to sirf log hota hai — visitor
// ko kabhi error nahi dikhta aur lead already DB me safe hai.

export interface CrmLeadPayload {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
}

// Forward a captured lead to the CRM. Never throws — callers can `await` it
// inside a try/catch (like the email calls) without risking the request.
export async function syncLeadToCrm(payload: CrmLeadPayload): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    // Sync intentionally disabled (env var not set) — skip quietly, same
    // pattern as email when SMTP creds are missing.
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CRM optionally verifies this against its LEAD_WEBHOOK_SECRET.
        ...(process.env.CRM_WEBHOOK_SECRET
          ? { 'x-webhook-secret': process.env.CRM_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`CRM sync failed (${res.status}) — lead still saved locally.`);
    }
  } catch (err) {
    console.error('CRM sync error (lead still saved locally):', err);
  }
}
