import { GenreTicker } from "@/components/landing/genre-ticker";
import { Hero } from "@/components/landing/hero";
import { Home } from "@/components/home/home";

/** Home: shortcuts, the featured banner and shelves of musicians and bands. */
export default function HomePage(): React.JSX.Element {
  return <Home banner={<Hero />} ticker={<GenreTicker />} />;
}
