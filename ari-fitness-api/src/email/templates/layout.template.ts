//template/layout.ts

import { emailHeader } from '../layout/header';
import { emailFooter } from '../layout/footer';

export function emailLayout(
    title: string,
    content: string,
    systemName = 'MvK Gym Manager'
): string {
    const primaryColor = '#4d8dff';
    const backgroundColor = '#0b0e14';
    const cardColor = '#11141c';
    const textColor = '#e3e3e3';
    const mutedColor = '#86888f';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${backgroundColor};font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;color:${textColor};">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${backgroundColor};padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${cardColor};border-radius:16px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.5);width:100%;max-width:600px;">
                    ${emailHeader(primaryColor, systemName)}

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 30px;">
                            <h2 style="margin:0 0 20px 0;color:${textColor};font-size:20px;font-weight:700;line-height:1.2;">${title}</h2>
                            <div style="font-size:16px;line-height:1.6;color:${textColor};">
                                ${content}
                            </div>
                        </td>
                    </tr>

                    ${emailFooter(mutedColor, systemName)}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `
}
