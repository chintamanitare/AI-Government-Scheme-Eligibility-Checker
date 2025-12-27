export default function AppFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          <span className="font-semibold">Disclaimer:</span> Hackathon project. Information may not be accurate. Verify details on official government websites.
        </p>
         <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-right">
          Built with Google Gemini & Firebase
        </p>
      </div>
    </footer>
  );
}
