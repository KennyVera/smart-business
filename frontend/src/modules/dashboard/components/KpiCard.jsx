import { ShoppingBag, DollarSign, Users, UserCheck } from "lucide-react";

const ICONS = {
  bag: ShoppingBag,
  dollar: DollarSign,
  users: Users,
  check: UserCheck,
};

function KpiCard({ title, value, delta, positive, icon, accent }) {
  const Icon = ICONS[icon];

  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card border-0 shadow-sm kpi-card${accent ? " kpi-card--accent" : ""}`}>
        <div className="card-body">
          <div className="kpi-card__head">
            <span>{title}</span>
            {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
          </div>
          <div className="kpi-card__value">{value}</div>
          <div
            className={`kpi-card__delta${
              positive === true ? " is-up" : positive === false ? " is-down" : " is-zero"
            }`}
          >
            {delta}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KpiCard;
