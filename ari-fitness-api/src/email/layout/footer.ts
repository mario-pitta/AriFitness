//footer.ts

export function emailFooter(mutedColor: string, systemName: string): string {
    return `
    <!-- Footer -->
    <tr>
        <td style="background-color:#0b0e14;padding:32px 24px;text-align:center;border-top:1px solid #1a1d24;">
            <p style="margin:0;font-size:14px;color:${mutedColor};font-weight:500;">
                &copy; ${new Date().getFullYear()} ${systemName}
            </p>
            <p style="margin:8px 0 0 0;font-size:12px;color:${mutedColor};">
                Se você tiver alguma dúvida, entre em contato com nosso suporte.
            </p>
        </td>
    </tr>
    `;
}
