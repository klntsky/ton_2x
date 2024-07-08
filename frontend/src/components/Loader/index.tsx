import s from './styles.module.css'

export const Loader = () => {
  return (
    <div className={s.loader}>
      <img src={'./logo_80x80.png'} alt="Logo" className={s.logo} />
    </div>
  )
}
