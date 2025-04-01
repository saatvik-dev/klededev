/**
 * Email templates for various types of emails sent to waitlist subscribers
 */

/**
 * Welcome email template sent when a user joins the waitlist
 */
export function generateWelcomeEmail(email: string): {subject: string, html: string} {
  const subject = "Welcome to the Klede Waitlist!";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Klede Waitlist</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #f8f8f8;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #000;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    h1 {
      color: #000;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #000;
      color: #fff;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">KLEDE</div>
    </div>
    <div class="content">
      <h1>Welcome to the Klede Waitlist</h1>
      <p>Thank you for joining our exclusive waitlist! We're thrilled to have you as part of our growing community.</p>
      
      <div class="highlight">
        <p>You've successfully registered with: <strong>${email}</strong></p>
      </div>
      
      <p>Klede is an exclusive collection of minimalist, high-quality essentials. We're working hard to create something special, and we can't wait to share it with you.</p>
      
      <p>What to expect next:</p>
      <ul>
        <li>Exclusive previews of our upcoming collection</li>
        <li>Early access when we launch</li>
        <li>Special offers for waitlist members only</li>
      </ul>
      
      <p>We'll keep you updated on our progress and let you know when we're ready to launch.</p>
      
      <p>Stay stylish,<br>The Klede Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Klede. All rights reserved.</p>
      <p>If you didn't sign up for the Klede waitlist, please disregard this email.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return { subject, html };
}

/**
 * Custom promotional email template
 * Can be used for special announcements or offers
 */
export function generatePromotionalEmail(email: string, customMessage: string = ""): {subject: string, html: string} {
  const subject = "Special Announcement from Klede";
  
  const messageSection = customMessage ? `
    <div class="highlight">
      <p>${customMessage}</p>
    </div>
  ` : '';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Announcement from Klede</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #f8f8f8;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #000;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    h1 {
      color: #000;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #000;
      color: #fff;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">KLEDE</div>
    </div>
    <div class="content">
      <h1>Special Announcement</h1>
      <p>Hello from Klede! As a valued member of our waitlist, we wanted to share some exciting news with you.</p>
      
      ${messageSection}
      
      <p>We appreciate your continued interest in Klede and can't wait to bring you more updates soon.</p>
      
      <p>Thank you for your support!</p>
      
      <p>Best regards,<br>The Klede Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Klede. All rights reserved.</p>
      <p>You're receiving this email because you joined the Klede waitlist with: ${email}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return { subject, html };
}

/**
 * Launch announcement email template
 * Sent when the collection is officially launched
 */
export function generateLaunchEmail(email: string): {subject: string, html: string} {
  const subject = "We're Live! Klede Collection Now Available";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klede Collection Now Available</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #f8f8f8;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #000;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    h1 {
      color: #000;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #000;
      color: #fff;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">KLEDE</div>
    </div>
    <div class="content">
      <h1>We're Live! 🎉</h1>
      <p>The wait is over! We're thrilled to announce that the Klede collection is now officially available.</p>
      
      <div class="highlight">
        <p>As a valued waitlist member, you get <strong>early access</strong> before we open to the general public.</p>
      </div>
      
      <p>Shop now and be among the first to experience our exclusive collection of minimalist, high-quality essentials.</p>
      
      <a href="https://klede.com/shop" class="btn">SHOP THE COLLECTION</a>
      
      <p>Thank you for your patience and support throughout our journey. We couldn't have done it without you.</p>
      
      <p>With gratitude,<br>The Klede Team</p>
      
      <p>P.S. Hurry! Some items are in limited supply and may sell out quickly.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Klede. All rights reserved.</p>
      <p>You're receiving this email because you joined the Klede waitlist with: ${email}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return { subject, html };
}