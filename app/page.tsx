import HolaMundo from '@components/HolaMundo';
import { readHomeData } from '@lib/dataService';

export default async function HomePage() {
  const data = await readHomeData();

  const { hero, meta } = data;

  return (
    <>
      <HolaMundo
        title={hero.headline}
        subtitle={hero.subtext}
        description={meta.description}
      />
    </>
  );
}
