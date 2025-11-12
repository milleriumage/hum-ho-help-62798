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
  userEmail: string;
  subject: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, userEmail, subject, message }: SupportEmailRequest = await req.json();

    console.log('Sending support email from', name, userEmail);
    
    const emailResponse = await resend.emails.send({
      from: "FunFans Support <onboarding@resend.dev>",
      to: ["linkteamcreators@gmail.com"],
      subject: `[Suporte] ${subject}`,
      reply_to: userEmail,
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
              .section { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📧 Nova Mensagem de Suporte</h1>
              </div>
              <div class="content">
                <div class="section">
                  <div class="label">Nome:</div>
                  <div class="value">${name}</div>
                </div>
                
                <div class="section">
                  <div class="label">Email do Usuário:</div>
                  <div class="value">${userEmail}</div>
                </div>
                
                <div class="section">
                  <div class="label">Motivo do Contato:</div>
                  <div class="value">${subject}</div>
                </div>
                
                <div class="section">
                  <div class="label">Mensagem:</div>
                  <div class="value">${message?.replace(/\n/g, '<br/>')}</div>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Esta mensagem foi enviada através do formulário de suporte do FunFans.<br>
                  Responda diretamente para: <strong>${userEmail}</strong>
                </p>
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
