import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbBell, TbAlertTriangle, TbInfoCircle, TbConfetti } from 'react-icons/tb';
import useAlerts from '../utils/useAlerts';

// Per-tone accent for the icon bubble on each alert row
const TONE = {
  warn: { Icon: TbAlertTriangle, bubble: 'bg-orange-100', icon: 'text-orange-500' },
  info: { Icon: TbInfoCircle, bubble: 'bg-brand-light-pink', icon: 'text-brand-dark-violet' },
  good: { Icon: TbConfetti, bubble: 'bg-emerald-100', icon: 'text-emerald-500' }
};

// Bell button + dropdown panel, designed to sit next to the profile avatar in
// a page header (both are 12×12 frosted circles). Alerts are computed live by
// useAlerts — nothing is stored, so there's no read/unread state; the badge
// simply shows how many things deserve attention right now.
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const alerts = useAlerts();
  const navigate = useNavigate();

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={`Notifications${alerts.length ? ` (${alerts.length})` : ''}`}
          className="relative w-12 h-12 rounded-full bg-white hover:bg-white/90 active:scale-90 transition-all duration-150 flex items-center justify-center"
        >
          <TbBell className="w-5 h-5 text-brand-dark-violet" />
          {alerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-orange-400 text-white text-[11px] font-causten font-bold flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>

        {open && (
          <div className="fixed left-5 right-5 top-26 bg-white rounded-2xl shadow-2xl z-60 overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-xs font-causten font-bold text-brand-dark-violet/60 uppercase tracking-widest">
              Alerts
            </p>

            {alerts.length === 0 ? (
              <p className="px-4 pb-5 pt-1 text-sm text-brand-dark-violet/45 font-causten">
                You're all caught up 🎉
              </p>
            ) : (
              <div className="pb-2">
                {alerts.map(alert => {
                  const { Icon, bubble, icon } = TONE[alert.tone] || TONE.info;
                  return (
                    <button
                      key={alert.id}
                      onClick={() => { setOpen(false); navigate(alert.to); }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-dark-violet/5 active:scale-[0.98] transition-all duration-150"
                    >
                      <div className={`w-9 h-9 rounded-full ${bubble} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${icon}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-brand-dark-violet font-causten font-bold text-sm">{alert.title}</p>
                        <p className="text-brand-dark-violet/60 text-xs mt-0.5 leading-snug">{alert.message}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click-away backdrop — transparent, closes the panel */}
      {open && <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />}
    </>
  );
};

export default NotificationBell;
