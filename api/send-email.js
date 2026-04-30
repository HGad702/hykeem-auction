// api/send-email.js
// Vercel serverless function — handles all email sending for the auction

const RESEND_API_KEY = 're_TyW7iHTu_DPRFR1esRVA4bEdvzixJdi6Y';
const FROM_EMAIL = 'auction@hykeemg.com';
const ARTIST_EMAIL = 'hykeemngad@yahoo.com';
const APP_URL = 'https://hykeem-auction.vercel.app';

export default async function handler(req, res) {
  // Allow CORS from your auction app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  try {
    let emailPayload;

    // ── BID CONFIRMATION (sent to bidder on first bid) ──
    if (type === 'bid_confirm') {
      const { name, email, pieceTitle, bidAmount, confirmToken, pieceId } = data;
      const confirmUrl = `${APP_URL}?confirm=${confirmToken}&bidder=${encodeURIComponent(email)}&piece=${pieceId}`;

      emailPayload = {
        from: `EVERY DAY. Art Exhibition <${FROM_EMAIL}>`,
        to: [email],
        subject: `Confirm your bid on "${pieceTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;padding:0;background:#0C0C14;font-family:'DM Sans',Helvetica,Arial,sans-serif">
            <div style="max-width:520px;margin:0 auto;padding:32px 20px">

              <!-- Header -->
              <div style="margin-bottom:28px">
                <div style="font-size:26px;font-weight:700;letter-spacing:.04em;line-height:1;margin-bottom:4px">
                  <span style="color:#E8172A">EVERY DAY</span><span style="color:#1A4BDB">.</span>
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:3px">An Art Exhibition from the mind of Hykeem G</div>
                <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">June 19th &middot; Las Vegas</div>
              </div>

              <!-- Card -->
              <div style="background:#13132A;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px;margin-bottom:20px">
                <div style="font-size:11px;font-weight:600;color:#7B5FE8;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">Bid confirmation</div>
                <div style="font-family:Georgia,serif;font-size:22px;color:#fff;margin-bottom:6px">Hi ${name.split(' ')[0]},</div>
                <div style="font-size:15px;color:rgba(255,255,255,.7);line-height:1.6;margin-bottom:20px">
                  Your bid of <strong style="color:#7B5FE8">${bidAmount}</strong> on <strong style="color:#fff">"${pieceTitle}"</strong> has been submitted. Click the button below to confirm your bid is real and keep your place in the auction.
                </div>

                <!-- CTA Button -->
                <a href="${confirmUrl}" style="display:block;background:#7B5FE8;border-radius:10px;padding:15px;text-align:center;text-decoration:none;color:#fff;font-size:16px;font-weight:600;letter-spacing:.02em;box-shadow:0 6px 20px rgba(123,95,232,.4)">
                  Confirm my bid &rarr;
                </a>
                <div style="font-size:11px;color:rgba(255,255,255,.35);text-align:center;margin-top:10px">
                  This link expires in 15 minutes. You'll receive a new one with each bid.
                </div>
              </div>

              <!-- Bid details -->
              <div style="background:#13132A;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:18px;margin-bottom:20px">
                <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Your bid details</div>
                <table style="width:100%;border-collapse:collapse">
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.5);padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)">Piece</td>
                    <td style="font-size:13px;color:#fff;font-weight:500;text-align:right;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)">${pieceTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.5);padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)">Your bid</td>
                    <td style="font-size:13px;color:#7B5FE8;font-weight:600;text-align:right;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)">${bidAmount}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:rgba(255,255,255,.5);padding:5px 0">Status</td>
                    <td style="font-size:13px;text-align:right;padding:5px 0"><span style="background:rgba(232,82,42,.2);color:#E8522A;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">Pending confirmation</span></td>
                  </tr>
                </table>
              </div>

              <!-- Footer -->
              <div style="font-size:11px;color:rgba(255,255,255,.25);line-height:1.6;text-align:center">
                If you didn't place this bid, you can ignore this email.<br>
                Questions? Find Hykeem or the Every Day. team at the show.
              </div>
            </div>
          </body>
          </html>
        `,
      };
    }

    // ── OUTBID ALERT (sent to previous top bidder) ──
    else if (type === 'outbid') {
      const { name, email, pieceTitle, newBidAmount, pieceId } = data;
      const bidUrl = `${APP_URL}?piece=${pieceId}&source=email`;

      emailPayload = {
        from: `EVERY DAY. Art Exhibition <${FROM_EMAIL}>`,
        to: [email],
        subject: `You've been outbid on "${pieceTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0C0C14;font-family:Helvetica,Arial,sans-serif">
            <div style="max-width:520px;margin:0 auto;padding:32px 20px">
              <div style="margin-bottom:24px">
                <div style="font-size:24px;font-weight:700;letter-spacing:.04em"><span style="color:#E8172A">EVERY DAY</span><span style="color:#1A4BDB">.</span></div>
                <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:3px">Art Exhibition &middot; June 19th &middot; Las Vegas</div>
              </div>
              <div style="background:#13132A;border:1px solid rgba(232,82,42,.3);border-radius:16px;padding:28px;margin-bottom:16px">
                <div style="font-size:11px;font-weight:600;color:#E8522A;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">You've been outbid</div>
                <div style="font-family:Georgia,serif;font-size:20px;color:#fff;margin-bottom:6px">Stay in the game, ${name.split(' ')[0]}</div>
                <div style="font-size:15px;color:rgba(255,255,255,.7);line-height:1.6;margin-bottom:20px">
                  Someone just outbid you on <strong style="color:#fff">"${pieceTitle}"</strong>. The current bid is now <strong style="color:#E8522A">${newBidAmount}</strong>.
                </div>
                <a href="${bidUrl}" style="display:block;background:#7B5FE8;border-radius:10px;padding:15px;text-align:center;text-decoration:none;color:#fff;font-size:16px;font-weight:600;box-shadow:0 6px 20px rgba(123,95,232,.4)">
                  Reclaim your lead &rarr;
                </a>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,.25);text-align:center">
                You're receiving this because you opted in to outbid alerts.
              </div>
            </div>
          </body>
          </html>
        `,
      };
    }

    // ── WINNER NOTIFICATION ──
    else if (type === 'winner') {
      const { name, email, pieceTitle, winAmount, pieceId } = data;

      emailPayload = {
        from: `EVERY DAY. Art Exhibition <${FROM_EMAIL}>`,
        to: [email],
        subject: `You won "${pieceTitle}" — congratulations!`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0C0C14;font-family:Helvetica,Arial,sans-serif">
            <div style="max-width:520px;margin:0 auto;padding:32px 20px">
              <div style="margin-bottom:24px">
                <div style="font-size:24px;font-weight:700;letter-spacing:.04em"><span style="color:#E8172A">EVERY DAY</span><span style="color:#1A4BDB">.</span></div>
                <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:3px">Art Exhibition &middot; June 19th &middot; Las Vegas</div>
              </div>
              <div style="background:#13132A;border:1px solid rgba(45,158,107,.4);border-radius:16px;padding:28px;margin-bottom:16px;text-align:center">
                <div style="font-size:40px;margin-bottom:12px">&#127942;</div>
                <div style="font-family:Georgia,serif;font-size:24px;color:#2D9E6B;margin-bottom:8px">You won!</div>
                <div style="font-size:15px;color:rgba(255,255,255,.7);line-height:1.6;margin-bottom:6px">
                  Congratulations ${name.split(' ')[0]} — your winning bid of <strong style="color:#7B5FE8">${winAmount}</strong> secured<br><strong style="color:#fff">"${pieceTitle}"</strong>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:16px;line-height:1.6">
                  Hykeem or the Every Day. team will be in touch shortly to arrange payment and delivery.<br><br>
                  Payment accepted: online (Stripe link coming), Square, cash, or Venmo at the show.<br>
                  Payment plans available — 30% deposit secures the piece.
                </div>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,.25);text-align:center">
                Questions? Find Hykeem at the show or reply to this email.
              </div>
            </div>
          </body>
          </html>
        `,
      };
    }

    // ── BUY IT NOW ALERT (sent to artist) ──
    else if (type === 'bin_alert') {
      const { buyerName, buyerEmail, buyerPhone, pieceTitle, binPrice } = data;

      emailPayload = {
        from: `EVERY DAY. Auction <${FROM_EMAIL}>`,
        to: [ARTIST_EMAIL],
        subject: `BUY IT NOW: ${buyerName} wants "${pieceTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0C0C14;font-family:Helvetica,Arial,sans-serif">
            <div style="max-width:520px;margin:0 auto;padding:32px 20px">
              <div style="margin-bottom:24px">
                <div style="font-size:24px;font-weight:700;letter-spacing:.04em"><span style="color:#E8172A">EVERY DAY</span><span style="color:#1A4BDB">.</span></div>
              </div>
              <div style="background:#13132A;border:2px solid #D4AF7A;border-radius:16px;padding:28px">
                <div style="font-size:11px;font-weight:600;color:#D4AF7A;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">&#128276; Buy It Now Request</div>
                <div style="font-family:Georgia,serif;font-size:20px;color:#fff;margin-bottom:16px">Someone wants to buy now</div>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="font-size:13px;color:rgba(255,255,255,.5);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">Piece</td><td style="font-size:13px;color:#fff;font-weight:500;text-align:right;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">${pieceTitle}</td></tr>
                  <tr><td style="font-size:13px;color:rgba(255,255,255,.5);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">Buy It Now price</td><td style="font-size:13px;color:#D4AF7A;font-weight:600;text-align:right;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">${binPrice}</td></tr>
                  <tr><td style="font-size:13px;color:rgba(255,255,255,.5);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">Buyer name</td><td style="font-size:13px;color:#fff;font-weight:500;text-align:right;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">${buyerName}</td></tr>
                  <tr><td style="font-size:13px;color:rgba(255,255,255,.5);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">Phone</td><td style="font-size:13px;color:#fff;text-align:right;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">${buyerPhone}</td></tr>
                  <tr><td style="font-size:13px;color:rgba(255,255,255,.5);padding:6px 0">Email</td><td style="font-size:13px;color:#fff;text-align:right;padding:6px 0">${buyerEmail}</td></tr>
                </table>
                <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:16px;line-height:1.6">
                  Find this person at the show or contact them directly to complete the sale. Once confirmed, close this auction in your dashboard.
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    }

    else {
      return res.status(400).json({ error: 'Unknown email type' });
    }

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend error:', result);
      return res.status(500).json({ error: result.message || 'Email send failed' });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
