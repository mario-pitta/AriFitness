//email/components/fallback-link.ts

export function emailFallbackLink(link: string): string {
    return `
  <p style="font-size:12px;color:#94a3b8;margin-top:20px;">
    Se o botão acima não funcionar, copie e cole o link abaixo no navegador:<br>
    <a href="${link}" style="color:#4d8dff;word-break:break-all;">
      ${link}
    </a>
  </p>
  `
}
