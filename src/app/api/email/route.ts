import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface EmailRequestBody {
  to: string;
  alertaKeyword: string;
  videoTitulo: string;
  videoUrl: string;
  outlierScore: number;
  views: number;
}

function buildHtmlEmail(body: EmailRequestBody): string {
  const { alertaKeyword, videoTitulo, videoUrl, outlierScore, views } = body;

  const fmtViews = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ViralScope — Alerta Viral</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:28px;">🔥</p>
              <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ViralScope — Alerta Viral</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Nicho monitoreado: <strong>${alertaKeyword}</strong></p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#0f0f1a;padding:32px 36px;border-left:1px solid rgba(139,92,246,0.2);border-right:1px solid rgba(139,92,246,0.2);">
              <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
                Encontramos un video viral en tu nicho monitoreado. Aquí están los detalles:
              </p>

              <!-- Video Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border:1px solid rgba(139,92,246,0.25);border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <!-- Outlier badge -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="background:linear-gradient(135deg,#f97316,#ef4444);border-radius:20px;padding:4px 14px;">
                          <span style="font-size:12px;font-weight:800;color:#ffffff;">🔥 ${outlierScore}x el promedio</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Title -->
                    <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#f1f5f9;line-height:1.4;">${videoTitulo}</p>

                    <!-- Stats row -->
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="padding-right:20px;">
                          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Vistas</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#a78bfa;">${fmtViews(views)}</p>
                        </td>
                        <td style="padding-right:20px;">
                          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Outlier Score</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#fb923c;">${outlierScore}x</p>
                        </td>
                        <td>
                          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Nicho</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">${alertaKeyword}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <a href="${videoUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">
                      ▶ Ver video en YouTube
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://viralscope.app"}/dashboard"
                       target="_blank"
                       style="display:inline-block;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);color:#a78bfa;text-decoration:none;font-size:13px;font-weight:600;padding:11px 24px;border-radius:10px;">
                      📊 Ver todos mis resultados
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070f;padding:20px 36px;border-radius:0 0 16px 16px;border:1px solid rgba(139,92,246,0.15);border-top:none;text-align:center;">
              <p style="margin:0;font-size:12px;color:#334155;line-height:1.8;">
                Recibiste este email porque tienes una alerta activa en ViralScope.<br/>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://viralscope.app"}/alertas" style="color:#6366f1;text-decoration:none;">Gestionar alertas →</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ sent: false, reason: "RESEND_API_KEY not configured" });
  }

  let body: EmailRequestBody;
  try {
    body = (await req.json()) as EmailRequestBody;
  } catch {
    return NextResponse.json({ sent: false, reason: "Invalid JSON body" }, { status: 400 });
  }

  const { to, alertaKeyword, videoTitulo, videoUrl, outlierScore, views } = body;

  if (!to || !alertaKeyword || !videoTitulo || !videoUrl) {
    return NextResponse.json({ sent: false, reason: "Missing required fields" }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromAddress = process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev";

    const { data, error } = await resend.emails.send({
      from: `ViralScope <${fromAddress}>`,
      to: [to],
      subject: `🔥 Nueva alerta viral: ${alertaKeyword}`,
      html: buildHtmlEmail({ to, alertaKeyword, videoTitulo, videoUrl, outlierScore, views }),
    });

    if (error) {
      return NextResponse.json({ sent: false, reason: error.message }, { status: 400 });
    }

    return NextResponse.json({ sent: true, id: data?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ sent: false, reason: message }, { status: 500 });
  }
}
