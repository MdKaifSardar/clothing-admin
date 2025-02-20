import { NextResponse } from "next/server";
import { getStaleCarts } from "@/lib/database/actions/admin/cart.actions";
import emailjs from "emailjs-com"; // ensure emailjs is installed

export async function GET() {
  // Get all stale carts
  const staleCarts = await getStaleCarts();

  // Process each cart to send an email
  await Promise.all(
    staleCarts.map(async (cart) => {
      if (cart.userEmail) {
        // Format the email content
        const emailContent = Array.isArray(cart.products)
          ? cart.products
              .map(
                (shirt) => `
                  <div style="border:1px solid #ddd; padding:10px; margin:10px 0; border-radius:5px; background:#f9f9f9;">
                    <p><strong>Price:</strong> $${shirt.price}</p>
                    <p><strong>Collar Style:</strong> ${
                      shirt.collarStyle || "N/A"
                    }</p>
                    <p><strong>Collar Button:</strong> ${
                      shirt.collarButton || "N/A"
                    }</p>
                    <p><strong>Collar Height:</strong> ${
                      shirt.collarHeight || "N/A"
                    }</p>
                    <p><strong>Cuff Style:</strong> ${
                      shirt.cuffStyle || "N/A"
                    }</p>
                    <p><strong>Cuff Links:</strong> ${
                      shirt.cuffLinks || "N/A"
                    }</p>
                    <p><strong>Watch Compatible:</strong> ${
                      shirt.watchCompatible ? "Yes" : "No"
                    }</p>
                    <p><strong>Bottom:</strong> ${shirt.bottom || "N/A"}</p>
                    <p><strong>Back:</strong> ${shirt.back || "N/A"}</p>
                    <p><strong>Pocket:</strong> ${shirt.pocket || "N/A"}</p>
                    <p><strong>Placket:</strong> ${shirt.placket || "N/A"}</p>
                    <p><strong>Sleeves:</strong> ${shirt.sleeves || "N/A"}</p>
                    <p><strong>Fit:</strong> ${shirt.fit || "N/A"}</p>
                  </div>
                `
              )
              .join("")
          : "<p>No products found.</p>";

        try {
          // Send email using emailjs
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, // Ensure this matches your service ID
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
              message: emailContent,
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          );
          console.log(`Email sent to ${cart.userEmail}`);
        } catch (error) {
          console.error(`Error sending email to ${cart.userEmail}:`, error);
        }
      }
    })
  );

  return NextResponse.json({ message: "Emails processed" });
}
