/**
 * Email templates for various types of emails sent to waitlist subscribers
 */

/**
 * Welcome email template sent when a user joins the waitlist
 */
export function generateWelcomeEmail(email: string): {subject: string, html: string} {
  const subject = 'Welcome to the Klede Collection Waitlist';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">KLEDE COLLECTION</h1>
        <p style="font-style: italic; color: #666;">Modern. Timeless. Sustainable.</p>
      </div>
      
      <div style="margin-bottom: 30px; line-height: 1.5;">
        <p>Hello,</p>
        <p>Thank you for joining the Klede Collection waitlist. We're thrilled to have you with us as we prepare for our exclusive launch.</p>
        <p>As a waitlist member, you'll be among the first to:</p>
        <ul style="margin-bottom: 20px;">
          <li>Receive updates about our upcoming collections</li>
          <li>Get early access to our products before the public release</li>
          <li>Enjoy exclusive discounts and special offers</li>
        </ul>
        <p>We're working hard to create something truly special and can't wait to share it with you.</p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 3px; font-weight: bold;">Discover Our Story</a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
        <p>This email was sent to ${email} because you signed up for the Klede Collection waitlist.</p>
        <p>If you believe this was a mistake, please disregard this email.</p>
        <p>&copy; ${new Date().getFullYear()} Klede Collection. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
}

/**
 * Custom promotional email template
 * Can be used for special announcements or offers
 */
export function generatePromotionalEmail(email: string, customMessage: string = ""): {subject: string, html: string} {
  const subject = 'Special Announcement from Klede Collection';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">KLEDE COLLECTION</h1>
        <p style="font-style: italic; color: #666;">Modern. Timeless. Sustainable.</p>
      </div>
      
      <div style="margin-bottom: 30px; line-height: 1.5;">
        <p>Hello,</p>
        <p>We have an exciting update to share with you as a valued member of our waitlist.</p>
        ${customMessage ? `<div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #000;">${customMessage}</div>` : ''}
        <p>Stay tuned for more updates as we get closer to our launch date.</p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 3px; font-weight: bold;">Learn More</a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
        <p>This email was sent to ${email} because you signed up for the Klede Collection waitlist.</p>
        <p>If you'd like to unsubscribe, please contact us directly.</p>
        <p>&copy; ${new Date().getFullYear()} Klede Collection. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
}

/**
 * Launch announcement email template
 * Sent when the collection is officially launched
 */
export function generateLaunchEmail(email: string): {subject: string, html: string} {
  const subject = '🎉 The Klede Collection is Now Live!';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">KLEDE COLLECTION</h1>
        <p style="font-style: italic; color: #666;">Modern. Timeless. Sustainable.</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-size: 28px; margin-bottom: 15px;">We're officially launched!</h2>
        <p style="font-size: 16px; line-height: 1.5;">The wait is over. Our collection is now available for you to explore and enjoy.</p>
      </div>
      
      <div style="margin-bottom: 30px; line-height: 1.5;">
        <p>Hello,</p>
        <p>We're thrilled to announce that the Klede Collection is now officially live. As a valued waitlist member, you get:</p>
        <ul style="margin-bottom: 20px;">
          <li><strong>Early access</strong> to browse and shop before we open to the public</li>
          <li><strong>Exclusive 15% discount</strong> on your first purchase with code <strong>WAITLIST15</strong></li>
          <li><strong>Free shipping</strong> on orders over $100</li>
        </ul>
        <p>This exclusive offer is available for the next 48 hours only, so don't miss out!</p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="#" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 3px; font-weight: bold; display: inline-block;">Shop Now</a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
        <p>This email was sent to ${email} because you signed up for the Klede Collection waitlist.</p>
        <p>If you'd like to unsubscribe, please contact us directly.</p>
        <p>&copy; ${new Date().getFullYear()} Klede Collection. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
}