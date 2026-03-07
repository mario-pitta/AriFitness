//header.ts

export function emailHeader(primaryColor: string, systemName: string): string {
    return `
    <!-- Header -->
    <tr>
        <td style="background:linear-gradient(135deg, #0b0e14, #1a1d24);padding:32px;text-align:left;border-bottom:1px solid #1a1d24;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="64" style="vertical-align:middle;">
                        <div style="background:rgba(255,255,255,0.05);width:64px;height:64px;border-radius:16px;padding:10px;box-sizing:border-box;border:1px solid rgba(255,255,255,0.1);">
                            <img src="https://mvkgym.vercel.app/assets/mvk-gym-manager-logo.png" alt="Logo" style="width:100%;height:100%;object-fit:contain;display:block;">
                        </div>
                    </td>
                    <td style="padding-left:20px;vertical-align:middle;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.03em;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${systemName}</h1>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;
}
