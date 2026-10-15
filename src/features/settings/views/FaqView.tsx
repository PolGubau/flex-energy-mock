import { ChevronDown, ChevronLeft } from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "EnergyDynamics® è disponibile per tutti?",
    a: "Se hai un contatore intelligente (Smart Meter), puoi attivare EnergyDynamics® in modalità prepagamento. Facile, comodo, flessibile.",
  },
  {
    q: "Come viene calcolato il consumo?",
    a: "Ogni giorno il sistema calcola quanta energia consumi e sottrae il relativo costo dal tuo credito. Il prezzo si basa sulla tua categoria (domestica o commerciale) secondo il nostro tariffario.",
  },
  {
    q: "Ho più forniture: posso usare EnergyDynamics® ovunque?",
    a: "Sì! Basta che ogni punto abbia un contatore intelligente installato.",
  },
  {
    q: "Posso pagare vecchie fatture con il credito?",
    a: "Sì. Se ci sono arretrati, puoi recuperarli con piccole rate giornaliere. Vale solo per il contratto attivo su EnergyDynamics®.",
  },
  {
    q: "Finito il credito: resto subito senza corrente?",
    a: "No, hai 7 giorni di tempo per ricaricare. Riceverai avvisi via SMS/email:\n• 1° avviso: credito quasi esaurito, ma ancora attivo.\n• 2° avviso: credito negativo, serve una ricarica.\n• 3° avviso: fine del periodo di tolleranza.\n• 4° avviso: corrente staccata. Serve una ricarica > credito negativo.\n\nNel portale vedrai lo stato del tuo contratto:\n• ATTIVO: corrente attiva.\n• GRAZIA: credito negativo, ricarica al più presto!\n• BLOCCATO: corrente sospesa. Serve ricarica superiore al debito.",
  },
  {
    q: "Cosa faccio se il credito è negativo?",
    a: "Ricarica il prima possibile. Consigliamo sempre di ricaricare più del debito. Esempio:\n• Saldo attuale: CHF -55.00\n• Ricarica: CHF 100.00\n• Nuovo saldo: CHF +45.00",
  },
  {
    q: "Riceverò comunque una fattura?",
    a: "Sì, ma solo una volta all'anno, per il conguaglio e la visione completa dei tuoi consumi.",
  },
  {
    q: "Dove posso ricaricare?",
    a: "Puoi acquistare ricariche presso rivenditori accreditati (senza minimo) oppure tramite il portale se la tua azienda elettrica lo prevede. Le ricariche dal portale sono a importi fissi (es. CHF 20, 50, 100). Importo massimo: CHF 3'000.00 a ricarica.",
  },
  {
    q: "Che segnali mi dà il contatore se resto senza corrente?",
    a: "Si accende una luce blu intermittente. Significa che la fornitura è stata sospesa.",
  },
  {
    q: "Se ricarico, torna subito la corrente?",
    a: "Sì. Dopo la ricarica (superiore al debito), la corrente torna in pochi minuti. Vedrai il cambio di stato nel portale. Premi il tasto -1- sul contatore per 4–8 secondi. La luce blu si spegne e sei di nuovo operativo.\n\nConsiglio: tieni a portata il numero del tuo contatore. Controlla che gli apparecchi spenti prima non si riattivino da soli.",
  },
  {
    q: "E se la corrente non torna dopo aver ricaricato?",
    a: "Se dopo aver effettuato correttamente la ricarica e aver premuto il tasto -1- la corrente non ritorna entro 5–10 minuti, contatta subito il Supporto Clienti per assistenza.",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <p className="text-sm text-muted-foreground leading-relaxed pb-4 whitespace-pre-line">{a}</p>
      )}
    </li>
  );
}

export function FaqView() {
  const navigate = useNavigate();
  return (
    <main className="pt-4 lg:pt-6 max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-1 text-muted-foreground" onClick={() => navigate("/settings")}>
        <ChevronLeft className="size-4" />
        Back
      </Button>
      <h2 className="font-bold text-lg md:text-xl mb-1 text-foreground">FAQ – EnergyDynamics®</h2>
      <p className="text-xs text-muted-foreground mb-6">Domande frequenti sulla piattaforma</p>
      <ul className="bg-card rounded-2xl border border-border px-5 list-none p-0 divide-y divide-border">
        {FAQ_ITEMS.map((item) => (
          <Fragment key={item.q}>
            <FaqItem q={item.q} a={item.a} />
          </Fragment>
        ))}
      </ul>
    </main>
  );
}
