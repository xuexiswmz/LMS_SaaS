import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { recentSessions } from "@/constants";

const Page = () => {
  return (
    <main>
      <h1>Popular Companions</h1>
      <section className="home-section">
        <CompanionCard
          id="1"
          name="Buddy"
          topic="JavaScript"
          subject="JavaScript Basics"
          duration={30}
          color="#ffda6e"
        />
        <CompanionCard
          id="2"
          name="Buddy"
          topic="JavaScript"
          subject="JavaScript Basics"
          duration={30}
          color="#e5d0ff"
        />
        <CompanionCard
          id="3"
          name="Buddy"
          topic="JavaScript"
          subject="JavaScript Basics"
          duration={30}
          color="#bde7ff"
        />
      </section>
      <section className="home-section">
        <CompanionsList
          title="Recent completed sessions"
          companions={recentSessions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
