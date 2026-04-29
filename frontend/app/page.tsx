export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* This MUST be the same height as your Navbar (h-20) */}
      <div className="h-20 w-full"></div> 
      
      <Hero />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <Services />
          <Doctors />
        </div>
      </section>
    </main>
  );
}