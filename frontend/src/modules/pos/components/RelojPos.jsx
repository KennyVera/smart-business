import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const HORA = { hour: "2-digit", minute: "2-digit", hour12: false };
const FECHA = { day: "2-digit", month: "short", year: "numeric" };

function RelojPos() {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pos-reloj">
      <Clock size={18} strokeWidth={1.75} />
      <div>
        <strong>{ahora.toLocaleTimeString("es-EC", HORA)}</strong>
        <small>{ahora.toLocaleDateString("es-EC", FECHA)}</small>
      </div>
    </div>
  );
}

export default RelojPos;
