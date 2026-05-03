import { Camera, Mail, Phone } from "lucide-react";

const timelineItems = [
  {
    label: "Entreprise",
    title: "Immersion à Wolfsburg",
    text: "À 10 ans, Paul contacte le PDG du groupe Volkswagen et passe près de 24 heures à observer le quotidien d’un dirigeant de grand groupe.",
  },
  {
    label: "International",
    title: "Granville High School, Ohio",
    text: "Une année scolaire aux États-Unis pour renforcer son anglais, son autonomie et sa capacité d’adaptation.",
  },
  {
    label: "Sport",
    title: "Sport-études tennis",
    text: "Plusieurs années de tennis à bon niveau, jusqu’au classement 15/4, avec discipline, rigueur et persévérance.",
  },
];

const commitmentItems = [
  "cours particuliers d’anglais depuis plus d’un an",
  "accompagnement d’élèves et entraide régulière",
  "engagement avec AFS pour aider des étudiants à partir à l’étranger",
];

const experienceItems = [
  "stage chez Volkswagen France",
  "travail en grande distribution chez Intermarché, développant rigueur et sens du service",
];

const contactItems = [
  {
    label: "Téléphone",
    value: "0638442092",
    href: "tel:0638442092",
    icon: Phone,
  },
  {
    label: "Email",
    value: "paul.moureu@icloud.com",
    href: "mailto:paul.moureu@icloud.com",
    icon: Mail,
  },
  {
    label: "Instagram",
    value: "@paulmoureu",
    href: "https://www.instagram.com/paulmoureu/",
    icon: Camera,
    external: true,
  },
];

export function AboutCard() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.6fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_22px_60px_-42px_rgba(24,34,48,0.4)] sm:p-7">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#f7f9f6]">
            <div className="aspect-[4/5]">
              <div className="flex h-full w-full items-center justify-center">
                <div className="grid h-32 w-32 place-items-center rounded-full border border-slate-200 bg-white text-4xl font-black tracking-tight text-lagoon shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  PM
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-black uppercase text-ink shadow-[0_18px_45px_-32px_rgba(24,34,48,0.55)] backdrop-blur">
              Créateur de Paul IA
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div>
              <p className="text-sm font-black uppercase text-lagoon">Identité</p>
              <h2 className="mt-2 text-4xl font-black leading-none tracking-tight text-ink">
                Paul Moureu
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">18 ans</p>
            </div>

            <p className="text-sm leading-7 text-slate-700">
              Étudiant français passionné par l’économie, le management et les nouvelles
              technologies, Paul s’intéresse à la manière dont les outils numériques peuvent
              améliorer l’apprentissage et rendre le travail plus efficace.
            </p>
          </div>
        </div>
      </aside>

      <div className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_22px_60px_-42px_rgba(24,34,48,0.4)] sm:p-9 lg:p-10">
          <p className="text-sm font-black uppercase text-sage">À propos du créateur</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-ink md:text-6xl">
            Une IA pensée par un étudiant, pour des étudiants.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700">
            Paul IA est né d’une idée simple : aider chaque étudiant à obtenir une réponse claire,
            structurée et personnalisée, sans devoir choisir lui-même le bon outil.
          </p>
        </div>

        <div className="grid gap-5">
          {timelineItems.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white p-5 shadow-[0_18px_45px_-36px_rgba(24,34,48,0.34)] transition hover:-translate-y-0.5 active:scale-[0.99] sm:grid-cols-[7rem_1fr] sm:p-6"
            >
              <div>
                <p className="text-xs font-black uppercase text-lagoon">{item.label}</p>
                <p className="mt-2 font-mono text-sm font-bold text-slate-400">
                  0{index + 1}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_18px_45px_-36px_rgba(24,34,48,0.34)] sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-ink">Transmission</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Paul s’implique dans l’accompagnement et la transmission, avec une attention
              particulière portée à l’anglais, à l’entraide et à l’ouverture internationale.
            </p>
            <ul className="mt-5 space-y-3">
              {commitmentItems.map((item) => (
                <li key={item} className="border-t border-slate-200 pt-3 text-sm font-semibold text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-slate-200/70 bg-[#1f2930] p-6 text-white shadow-[0_18px_45px_-36px_rgba(24,34,48,0.5)] sm:p-8">
            <h2 className="text-2xl font-black tracking-tight">Expérience concrète</h2>
            <ul className="mt-5 space-y-4">
              {experienceItems.map((item) => (
                <li key={item} className="border-t border-white/15 pt-4 text-sm font-semibold leading-7 text-white/86">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-white/75">
              Aujourd’hui, Paul poursuit un parcours orienté vers l’économie et le management, avec
              pour objectif de faire des études de commerce.
            </p>
          </section>
        </div>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_22px_60px_-42px_rgba(24,34,48,0.4)] sm:p-9">
          <div className="grid gap-5 lg:grid-cols-2">
            <blockquote className="rounded-[1.5rem] bg-[#f7f9f6] p-6 text-lg font-black leading-8 tracking-tight text-ink">
              “Une intelligence artificielle pensée pour les étudiants, capable de s’adapter à
              chaque profil et de proposer des réponses réellement utiles, structurées et
              personnalisées.”
            </blockquote>
            <blockquote className="rounded-[1.5rem] bg-lagoon p-6 text-lg font-black leading-8 tracking-tight text-white">
              “Rendre l’apprentissage plus intelligent, plus rapide et plus accessible.”
            </blockquote>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_22px_60px_-42px_rgba(24,34,48,0.4)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-sage">Contact</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">Coordonnées</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Les liens ci-dessous permettent de contacter Paul directement.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-lagoon hover:shadow-[0_18px_45px_-32px_rgba(24,34,48,0.38)] active:scale-[0.98]"
                >
                  <Icon className="h-5 w-5 text-lagoon" strokeWidth={1.8} aria-hidden="true" />
                  <span className="mt-5 block text-xs font-black uppercase text-slate-500">
                    {item.label}
                  </span>
                  <span className="mt-1 block break-words text-sm font-black text-ink group-hover:text-lagoon">
                    {item.value}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <div className="rounded-[1.5rem] border border-lagoon/20 bg-lagoon/10 p-5 text-sm font-black leading-6 text-ink">
          Projet en cours de développement – Paul IA évoluera avec le temps.
        </div>
      </div>
    </section>
  );
}
