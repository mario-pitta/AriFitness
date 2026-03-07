//email/components/message-box.ts

export function emailMessageBox(message: string): string {
    return `
  <p style="
    font-size:14px;
    color:#d1d5db;
    background-color:#1a1d24;
    padding:16px;
    border-radius:8px;
    border-left:4px solid #4d8dff;
    margin-top:20px;
  ">
    ${message}
  </p>
  `
}
