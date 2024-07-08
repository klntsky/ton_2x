import { ButtonHTMLAttributes } from 'react'
import s from './style.module.css'

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={[s.primaryButton, s.className].join(' ')}
    ></button>
  )
}
