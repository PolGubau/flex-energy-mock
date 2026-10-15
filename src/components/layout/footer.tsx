export function Footer() {
  return (
    <footer className="pb-24 lg:pb-0 px-5 lg:px-10 py-3 border-t border-border bg-muted/30">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center">
        <img 
          src="/logo-flexenergy.jpeg" 
          alt="FlexEnergy" 
          className="h-5 object-contain opacity-40 hover:opacity-60 transition-opacity"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
    </footer>
  );
}
