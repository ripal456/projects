import Navbar from "@/components/Navbar";
import ClientHome from "@/components/ClientHome";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4">
        <ClientHome />
      </main>
    </div>
  );
}
