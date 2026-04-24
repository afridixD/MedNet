import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/national-cancer-institute-BxXgTQEw1M4-unsplash.jpg"
          alt="Medical Background"
          fill
          priority
          className="object-cover opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent/50 to-black"></div>
      </div>

      <div className="max-w-5xl w-full text-center space-y-8 relative z-10">

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl font-semibold text-white tracking-tighter font-poppins">
          Healthcare{" "}
          <span className="text-blue-600 font-poppins">Simplified.</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed font-manrope">
          The modern platform for BRAC University students and faculty to 
          manage medical consultations, prescriptions, and digital records 
          in one secure place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">

          <Link href='/register'>
            <button className="text-lg px-8 py-4 bg-blue-600 border-2 border-blue-600 text-white font-bold rounded-full hover:bg-white hover:border-white hover:text-blue-600 transition-all duration-300 active:scale-95 font-manrope">
            Create an Account
            </button>
          </Link>

          <Link href='/login'>
            <button className="text-lg px-8 py-4 bg-white border-2 border-slate-200 text-blue-600 font-bold rounded-full hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 active:scale-95 font-manrope">
            Already have an Account?
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}