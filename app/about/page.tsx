import { AboutCard } from "@/components/AboutCard";

export const metadata = {
  title: "À propos du créateur | Paul IA",
  description: "Découvrez Paul Moureu, créateur de Paul IA.",
};

export default function AboutPage() {
  return (
    <main className="px-5 py-10 sm:px-8 lg:py-16">
      <AboutCard />
    </main>
  );
}
