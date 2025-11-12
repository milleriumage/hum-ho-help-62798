// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    console.log('Sending support email from', name, email);
    
    const emailResponse = await resend.emails.send({
      from: "FunFans Support <onboarding@resend.dev>",
      to: ["linkteamcreators@gmail.com"],
      subject: `Support Request from ${name}`,
      reply_to: email,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .label { font-weight: bold; color: #667eea; margin-top: 15px; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Nova Mensagem de Suporte</h1>
              </div>
              <div class="content">
                <div class="label">Nome:</div>
                <div class="value">${name}</div>
                
                <div class="label">Email:</div>
                <div class="value">${email}</div>
                
                <div class="label">Mensagem:</div>
                <div class="value">${message?.replace(/\n/g, '<br/>')}</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log('Email sent successfully:', emailResponse);

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
