//templates/new-user.template.ts

import { emailLayout } from './layout.template'
import { NewUserEmail } from '../interface/email.interfaces'

import { emailButton } from '../components/button'
import { emailFallbackLink } from '../components/fallback-link'

export function newUserTemplate(data: NewUserEmail): string {

    const content = `
    <p>Olá <strong>${data.name}</strong>,</p>

    <p>
      Seja bem-vindo ao <strong>MvK Gym Manager</strong>!
      Sua conta foi criada com sucesso.
    </p>

    ${emailButton('Acessar Minha Conta', data.loginLink)}

    <p style="font-size:14px;">
      Agora você já pode acessar a plataforma e começar a utilizar
      todas as funcionalidades.
    </p>

    ${emailFallbackLink(data.loginLink)}
  `

    return emailLayout('Bem-vindo ao MvK Gym Manager', content)
}