import nodemailer from "nodemailer";

// Konfigurasi transporter menggunakan Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:5173/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    text: `You requested a password reset. Click the link below to reset your password: ${resetLink}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="padding: 20px; text-align: center;">
        <img src="https://i.pinimg.com/564x/a5/71/9c/a5719c3325c4339b98e92e43ea3861b4.jpg" alt="Survey Image" style="max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 5px" />

        <p style="color: #333; font-size: 16px; text-align: center; margin-bottom: 20px;">
        Thanks for being a valued subscriber! We're curious: Why do you like what we do? How can we make it better?
        </p>

        <a href="${resetLink}" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; margin-bottom: 20px;">
            Reset Password
        </a>


        <p style="font-size: 14px; color: #555; text-align: center;">
        We'd appreciate it if you could take just a few minutes to share your thoughts so we can improve our newsletter and overall service. Thank you for taking our brief, anonymous survey.
        </p>
    </div>

    <!-- Footer section -->
    <div style="background-color: #222222; padding: 20px; text-align: center; padding: 15px; border-radius: 5px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0;">
        If you didn’t make that request, contact us at <a href="mailto:support@example.com" style="color: #28a745; text-decoration: none;">support@example.com</a>
        </p>

        <!-- Social Media Icons -->
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
        <div style="background-color: #ffffff; padding: 10px; border-radius: 50%; margin: 0 10px;">
            <a href="https://facebook.com" style="text-decoration: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook" style="color: #222222;">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            </a>
        </div>

        <div style="background-color: #ffffff; padding: 10px; border-radius: 50%; margin: 0 10px;">
            <a href="https://twitter.com" style="text-decoration: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter" style="color: #222222;">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
            </a>
        </div>

        <div style="background-color: #ffffff; padding: 10px; bor-radius: 50%; margin: 0 10px;">
            <a href="https://instagram.com" style="text-decoration: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram" style="color: #222222;">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            </a>
        </div>
        </div>
    </div>
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent to", email);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }
};
