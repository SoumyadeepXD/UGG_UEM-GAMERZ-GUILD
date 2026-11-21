import EventSlider from "@/components/EventSlider";
import { initialTournaments } from "@/data/initialTournaments";

/**
 * Isolated test harness for Carousel accessibility and motion verification.
 * Guaranteed multi-slide test environment for Playwright suites.
 */
export default function TestCarouselPage() {
  return (
    <div className="bg-[#060709] min-h-screen text-white">
      <EventSlider initialTournaments={initialTournaments} />
    </div>
  );
}
