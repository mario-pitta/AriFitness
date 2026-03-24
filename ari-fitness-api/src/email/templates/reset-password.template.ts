//reset-password.template.ts

import { emailLayout } from './layout.template'
import { ResetPasswordEmail } from '../interface/email.interfaces'

import { emailButton } from '../components/button'
import { emailMessageBox } from '../components/message-box'
import { emailFallbackLink } from '../components/fallback-link'

export function resetPasswordTemplate(data: ResetPasswordEmail): string {

  const content = `
    <p>Olá <strong>${data.name}</strong>,</p>

    <p>
      Recebemos uma solicitação para redefinir a senha da sua conta no 
      <strong>MvK Gym Manager</strong>.
    </p>

    ${emailButton('Redefinir Minha Senha', data.redirectUrl)}

    ${emailMessageBox(`
      <strong>Segurança:</strong> Se você não solicitou a redefinição de senha,
      nenhuma ação é necessária.
    `)}

    ${emailFallbackLink(data.redirectUrl)}
  `

  return emailLayout('Redefinição de Senha', content)
}