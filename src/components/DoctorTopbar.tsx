import { ClipboardPlus, Stethoscope } from 'lucide-react'
import { Brand } from './Brand'

export type DoctorView = 'prescription' | 'pe'

export function DoctorTopbar({ active, onNavigate }: { active: DoctorView; onNavigate: (view: DoctorView) => void }) {
  return (
    <header className="topbar doctor-topbar">
      <Brand />
      <nav className="doctor-nav" aria-label="醫師工具">
        <button type="button" className={active === 'prescription' ? 'is-active' : ''} aria-current={active === 'prescription' ? 'page' : undefined} onClick={() => onNavigate('prescription')}>
          <ClipboardPlus aria-hidden="true" />
          <span>運動處方</span>
        </button>
        <button type="button" className={active === 'pe' ? 'is-active' : ''} aria-current={active === 'pe' ? 'page' : undefined} onClick={() => onNavigate('pe')}>
          <Stethoscope aria-hidden="true" />
          <span>PE／DD</span>
        </button>
      </nav>
      <div className="topbar__status"><span />義診快速開立模式</div>
    </header>
  )
}
