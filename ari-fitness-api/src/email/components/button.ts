//email/components/button.ts

export function emailButton(label: string, link: string, color = '#4d8dff'): string {
    return `
  <div style="text-align:center;margin:40px 0;">
    <a href="${link}"
      style="
        background-color:${color};
        color:#ffffff;
        padding:14px 28px;
        text-decoration:none;
        border-radius:8px;
        font-weight:600;
        display:inline-block;
        font-size:15px;
        box-shadow:0 4px 10px rgba(0,0,0,0.25);
      ">
      ${label}
    </a>
  </div>
  `
}
