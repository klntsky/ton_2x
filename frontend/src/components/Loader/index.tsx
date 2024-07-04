import s from './styles.module.css'

import logo from './logo.png'

export const Loader = () => {
  return (
    <div className={s.loader}>
      <img src={logo} alt="Logo" className={s.logo} />
    </div>
  )
}
