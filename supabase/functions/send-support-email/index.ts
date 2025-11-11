import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: SupportEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "FunFans Support <onboarding@resend.dev>",
      to: ["linkteamcreators@gmail.com"],
      subject: `Support message from ${name}`,
      reply_to: email,
      html: `
        <h2>New Support Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message?.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-support-email error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
