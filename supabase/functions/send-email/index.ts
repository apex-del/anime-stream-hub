// Anime-themed transactional email sender (Welcome / Password Reset Notice / Login Alert).
// Auth emails (signup confirm + recovery link) are still managed by Supabase Auth.
// Use this to send branded "extras" via Resend.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "AnimeStream <onboarding@resend.dev>"; // change once you verify a domain in Resend

type Kind = "welcome" | "login_alert" | "password_reset_notice" | "generic";

function shell(title: string, accent: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0a0a14;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#e8e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;font-size:28px;font-weight:900;letter-spacing:-0.5px;
        background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;
        background-clip:text;color:transparent;">⛩ AnimeStream</div>
    </div>
    <div style="background:linear-gradient(180deg,#16162a,#0f0f1f);border:1px solid #2a2a45;
      border-radius:16px;padding:32px 24px;box-shadow:0 20px 60px -20px ${accent}66;">
      <div style="height:3px;width:48px;background:${accent};border-radius:3px;margin-bottom:20px;"></div>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#fff;">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;margin-top:24px;font-size:11px;color:#6a6a80;">
      You're receiving this from AnimeStream · Discover, track, download.<br>
      Not your account? Just ignore this email.
    </p>
  </div>
</body></html>`;
}

function welcomeTpl(name: string) {
  return shell(
    `Welcome to the party, ${name}! 🍿`,
    "#a855f7",
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cdcde0;">
       Your AnimeStream account is live. Time to plot your binge.
     </p>
     <ul style="padding-left:18px;color:#b8b8ce;line-height:1.8;font-size:14px;">
       <li>⭐ Favorite anime to follow across devices</li>
       <li>📅 Track watch history with episode progress</li>
       <li>💬 Comment & react with the community</li>
       <li>⬇️ One-tap download links from trusted hosts</li>
     </ul>
     <a href="https://anidown.lovable.app" style="display:inline-block;margin-top:18px;
       background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;
       padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;">
       Start exploring →
     </a>`
  );
}

function loginAlertTpl(name: string, when: string) {
  return shell(
    `New sign-in detected 🛡`,
    "#22d3ee",
    `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#cdcde0;">
       Hey ${name}, we noticed a fresh sign-in to your AnimeStream account.
     </p>
     <div style="background:#0a0a14;border:1px solid #2a2a45;border-radius:10px;padding:14px;
       font-size:13px;color:#b8b8ce;margin:14px 0;">
       <strong style="color:#22d3ee;">When:</strong> ${when}<br>
       <strong style="color:#22d3ee;">Action:</strong> If this wasn't you, change your password immediately.
     </div>
     <p style="font-size:13px;color:#8888a0;margin:0;">Was it you? Then you're good — enjoy the next episode.</p>`
  );
}

function passwordResetNoticeTpl(name: string) {
  return shell(
    `Password reset requested 🔑`,
    "#f59e0b",
    `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#cdcde0;">
       Hey ${name} — a password reset was requested for your account. We've sent the secure reset link in a separate email.
     </p>
     <p style="font-size:13px;color:#8888a0;margin:14px 0 0;">
       Didn't request this? You can safely ignore both emails — your current password still works.
     </p>`
  );
}

function genericTpl(subject: string, html: string) {
  return shell(subject, "#a855f7", html);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
    const { kind, to, name, subject, html, meta } = await req.json() as {
      kind: Kind;
      to: string;
      name?: string;
      subject?: string;
      html?: string;
      meta?: Record<string, string>;
    };
    if (!to) throw new Error("Missing 'to'");
    const display = name || to.split("@")[0];

    let finalSubject = subject || "Hello from AnimeStream";
    let finalHtml = "";
    switch (kind) {
      case "welcome":
        finalSubject = "🎉 Welcome to AnimeStream";
        finalHtml = welcomeTpl(display);
        break;
      case "login_alert":
        finalSubject = "🛡 New sign-in to your AnimeStream";
        finalHtml = loginAlertTpl(display, meta?.when || new Date().toUTCString());
        break;
      case "password_reset_notice":
        finalSubject = "🔑 Password reset requested";
        finalHtml = passwordResetNoticeTpl(display);
        break;
      default:
        finalHtml = genericTpl(finalSubject, html || "");
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: finalSubject,
        html: finalHtml,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`Resend ${r.status}: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
