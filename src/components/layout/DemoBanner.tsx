import { resetDemoState } from "@/demo/store";

export function DemoBanner() {
  return (
    <aside
      aria-label="Demo mode"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs text-primary"
    >
      <p>
        <strong>DEMO</strong> · Simulated data · No real payments · No external
        connections
      </p>
      <button
        type="button"
        className="font-semibold underline underline-offset-2"
        onClick={() => {
          resetDemoState();
          window.location.reload();
        }}
      >
        Reset demo
      </button>
    </aside>
  );
}
