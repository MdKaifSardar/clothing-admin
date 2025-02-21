import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getStaleCarts } from "@/lib/database/actions/admin/cart.actions";

export async function GET() {
  // Get all stale carts
  const staleCarts = await getStaleCarts();

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail email
      pass: process.env.EMAIL_PASS, // App Password (not your Gmail password)
    },
  });

  // Process each cart to send an email
  await Promise.all(
    staleCarts.map(async (cart) => {
      if (cart.user && cart.user.email) {
        // Format the email content
        const emailContent = `
  <div style="max-width: 60vw; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">

    <!-- Top Image -->
    <img src="https://res.cloudinary.com/djndrffon/image/upload/v1740094588/leftCart_top_v8us6e.png" alt="Top Banner" style="width: 100%; border-radius: 10px; display: block;">

    <!-- Greeting Text -->
    <p style="text-align: center; font-size: 22px; font-weight: bold; color: #333;">
      Well, Well, Well if it isn't ${cart.user.firstName} ${cart.user.lastName}
    </p>

    <p style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; color: #333;">
      You have items waiting in your cart!
    </p>

    <!-- Product Details in Grid Layout -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: auto; gap: 1rem;">
      ${
        Array.isArray(cart.products)
          ? cart.products
              .map(
                (shirt, index) => `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: white; min-width: 250px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);">
                  <h3 style="text-align: center; font-size: 18px; color: #007bff; margin-bottom: 10px;">Product ${
                    index + 1
                  }</h3>
                  <p style="font-size: 16px; color: #333; margin: 5px 0;"><strong>Price:</strong> $${
                    shirt.price
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Collar Style:</strong> ${
                    shirt.collarStyle || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Collar Button:</strong> ${
                    shirt.collarButton || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Collar Height:</strong> ${
                    shirt.collarHeight || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Cuff Style:</strong> ${
                    shirt.cuffStyle || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Cuff Links:</strong> ${
                    shirt.cuffLinks || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Watch Compatible:</strong> ${
                    shirt.watchCompatible ? "Yes" : "No"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Bottom:</strong> ${
                    shirt.bottom || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Back:</strong> ${
                    shirt.back || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Pocket:</strong> ${
                    shirt.pocket || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Placket:</strong> ${
                    shirt.placket || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Sleeves:</strong> ${
                    shirt.sleeves || "N/A"
                  }</p>
                  <p style="font-size: 14px; color: #555; margin: 5px 0;"><strong>Fit:</strong> ${
                    shirt.fit || "N/A"
                  }</p>
                </div>
              `
              )
              .join("")
          : "<p style='text-align: center; font-size: 16px; color: #777;'>No products found.</p>"
      }
    </div>

    <!-- Visit Site Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://smc-new-final.vercel.app/" 
        style="display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">
        Continue Shopping
      </a>
    </div>

    <!-- Bottom Image -->
    <img src="https://res.cloudinary.com/djndrffon/image/upload/v1740093583/leftCart_xla8w7.png" alt="Bottom Banner" style="width: 100%; border-radius: 10px; display: block;">
  </div>
`;

        // Email options
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: cart.user.email,
          //   to: "asma007sardar@gmail.com",
          subject: "Reminder: Items in Your Cart",
          html: `<p>You have items in your cart:</p>${emailContent}`,
        };

        console.log(`Sending email to ${cart.user.email}...`);

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Email sent successfully to ${cart.user.email}`);
        } catch (error) {
          console.error(`Error sending email to ${cart.user.email}:`, error);
        }
      }
    })
  );

  return NextResponse.json({ message: "Emails processed" });
}
