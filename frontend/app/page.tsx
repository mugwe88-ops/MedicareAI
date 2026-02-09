import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Specialties from "./components/Specialties";
import Doctors from "./components/Doctors";


export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <Specialties />
      <Doctors />
    </div>
  );
}
