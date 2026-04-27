import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <div className=" min-h-screen flex items-center justify-center">
        
        <h1 className="text-red-500 text-5xl">It is the Home page </h1>

      </div>
      <Footer />
    </>
  );
}
