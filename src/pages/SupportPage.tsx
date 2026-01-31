import React from 'react';
import { useAppSelector } from '../store/hooks';
import { Github, Linkedin, Mail, Code2, Bug, BookOpen } from 'lucide-react';

// Componenti riutilizzabili dell'app
import HamburgerSidebar from '../components/hamburgerSidebar/HamburgerSidebar';
import ProfileView from '../components/ProfileView'; // Riutilizziamo il tuo componente!

// --- DATI STATICI (CONFIGURAZIONE) ---

const TEAM_MEMBERS = [
    {
        id: 'dev1',
        name: 'Alessio Torrieri',
        role: 'Full Stack Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Flebo',
        github: '#',
        linkedin: '#'
    },
    {
        id: 'dev2',
        name: 'Matteo Paolino',
        role: 'Full Stack Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matteo',
        github: '#',
        linkedin: '#'
    },
    {
        id: 'dev3',
        name: 'Mattia Burtini',
        role: 'Full Stack Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mattia',
        github: '#',
        linkedin: '#'
    }
];

const TECH_STACK = [
    "React", "TypeScript", "Redux Toolkit", "Boardgame.io", "Tailwind CSS", "Node.js"
];

const FAQS = [
    {
        q: "Come funziona il movimento?",
        a: "Lancia i dadi e muoviti nelle caselle illuminate. Se entri in una stanza, devi fermarti e formulare un'ipotesi."
    },
    {
        q: "Posso giocare da solo?",
        a: "Sì! Scegli 'Gioca in Locale' per sfidare i nostri Bot intelligenti."
    },
    {
        q: "Cosa succede se sbaglio l'accusa?",
        a: "Vieni eliminato dalla partita, ma puoi continuare a smentire le ipotesi degli altri giocatori."
    }
];

// --- SOTTO-COMPONENTI (ATOMS & MOLECULES) ---

const TeamCard: React.FC<{ member: typeof TEAM_MEMBERS[0] }> = ({ member }) => (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center gap-4 hover:border-yellow-500 transition-colors group">
        <ProfileView 
            name={member.name} 
            imageUrl={member.avatar} 
            size="large" 
            layout="vertical" 
            variant="game" // Usiamo la variante game per dare coerenza
            isActive={false}
        />
        <div className="text-center">
            <p className="text-yellow-500 font-bold text-sm tracking-widest uppercase">{member.role}</p>
        </div>
        
        {/* Social Links */}
        <div className="flex gap-4 mt-2">
            <a href={member.github} className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href={member.linkedin} className="text-slate-400 hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
        </div>
    </div>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
    <div className="bg-slate-900/50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
        <h4 className="font-bold text-white mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-500" /> {question}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed">{answer}</p>
    </div>
);

const TechBadge: React.FC<{ label: string }> = ({ label }) => (
    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
        {label}
    </span>
);


// --- PAGINA PRINCIPALE (ORGANISM) ---

const SupportPage: React.FC = () => {
    const user = useAppSelector(state => state.user);
    
        // User data from Redux
        const currentUser = {
            displayName: user.displayName,
            avatar: user.avatarUrl,
            isOnline: user.isOnline
        };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-x-hidden">
            
            {/* Sidebar di Navigazione */}
            <HamburgerSidebar user={currentUser} />

            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 z-10 flex flex-col gap-16">

                {/* HEADER HERO */}
                <div className="text-center space-y-4 animate-fade-in-down">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Chi Siamo & <span className="text-yellow-500">Supporto</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Cluedo Digital è un progetto open-source nato dalla passione per i giochi da tavolo e la tecnologia web moderna.
                    </p>
                </div>

                {/* SEZIONE 1: IL TEAM (About Us) */}
                <section className="animate-fade-in-up delay-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px bg-slate-800 flex-1" />
                        <h2 className="text-xl font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-yellow-500" /> Il Team
                        </h2>
                        <div className="h-px bg-slate-800 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                        {TEAM_MEMBERS.map(member => (
                            <TeamCard key={member.id} member={member} />
                        ))}
                        
                    </div>
                </section>

                {/* SEZIONE 2: TECH STACK */}
                <section className="text-center animate-fade-in-up delay-200">
                    <p className="text-slate-500 text-sm mb-4 uppercase tracking-widest font-bold">Powered By</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {TECH_STACK.map(tech => <TechBadge key={tech} label={tech} />)}
                    </div>
                </section>

                {/* SEZIONE 3: FAQ & SUPPORTO */}
                <section className="grid md:grid-cols-2 gap-12 animate-fade-in-up delay-300">
                    
                    {/* FAQ Column */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-6">Domande Frequenti</h3>
                        <div className="space-y-4">
                            {FAQS.map((faq, idx) => (
                                <FaqItem key={idx} question={faq.q} answer={faq.a} />
                            ))}
                        </div>
                    </div>

                    {/* Report Column */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Hai trovato un Bug? 🐛</h3>
                            <p className="text-slate-400 mb-6">
                                Essendo una versione beta, potresti incontrare degli errori imprevisti. 
                                Aiutaci a migliorare segnalandoli.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <button className="w-full py-4 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                                <Bug className="w-5 h-5" />
                                Segnala un Bug
                            </button>
                            <button className="w-full py-4 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                                <Mail className="w-5 h-5" />
                                Contattaci via Email
                            </button>
                        </div>
                    </div>

                </section>

                {/* FOOTER */}
                <footer className="text-center text-slate-600 text-xs py-8 border-t border-slate-900">
                    <p>Cluedo Digital © 2024. Not affiliated with Hasbro.</p>
                    <p>Made with ❤️ and lots of ☕.</p>
                </footer>

            </main>
        </div>
    );
};

export default SupportPage;