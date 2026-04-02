type PageStatus = "success" | "error" | "warning";

export function renderVerificationPage(
  status: PageStatus,
  title: string,
  message: string,
): string {
  const config = {
    success: {
      icon: "✅",
      color: "#22c55e",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      btnText: "Ir a iniciar sesión",
      btnLink: "myapp://login", // deep link a tu app
    },
    error: {
      icon: "❌",
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
      btnText: "Solicitar nuevo enlace",
      btnLink: "myapp://resend-verification",
    },
    warning: {
      icon: "⚠️",
      color: "#f59e0b",
      bg: "#fffbeb",
      border: "#fde68a",
      btnText: "Ir a iniciar sesión",
      btnLink: "myapp://login",
    },
  }[status];

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .icon-wrap {
          background: ${config.bg};
          border: 2px solid ${config.border};
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin: 0 auto 1.5rem;
        }
        h1 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }
        p {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .btn {
          display: inline-block;
          background: ${config.color};
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.85; }
        .footer {
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon-wrap">${config.icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a class="btn" href="${config.btnLink}">${config.btnText}</a>
        <p class="footer">Si tienes problemas, contáctanos.</p>
      </div>
    </body>
    </html>
  `;
}
