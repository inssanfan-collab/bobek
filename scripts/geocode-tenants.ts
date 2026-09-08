import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { geocodeAddress } from '../src/server/maps/yandex';

const prisma = new PrismaClient();

/** Между запросами к геокодеру — пауза: у бесплатного тарифа есть лимит в секунду. */
const PAUSE_MS = 300;

/**
 * Добор координат для садов, заведённых до появления геокодера.
 *
 * По умолчанию трогает только те сады, у которых координат нет: точку, которую
 * заведующая поставила руками, геокодер почти наверняка испортит. Флаг --all
 * пересчитывает все — им пользуются, когда сады заводили с одной общей точкой.
 *
 *   pnpm maps:geocode
 *   pnpm maps:geocode --all
 */
async function main() {
  const all = process.argv.includes('--all');

  const profiles = await prisma.tenantProfile.findMany({
    where: {
      addressRu: { not: null },
      ...(all ? {} : { OR: [{ lat: null }, { lng: null }] }),
    },
    select: { tenantId: true, nameRu: true, addressRu: true, lat: true, lng: true },
    orderBy: { nameRu: 'asc' },
  });

  if (profiles.length === 0) {
    console.log('Садов с адресом и без координат нет.');
    return;
  }

  console.log(`Определяем координаты: садов — ${profiles.length}.`);
  let filled = 0;

  for (const profile of profiles) {
    const point = await geocodeAddress(profile.addressRu ?? '');

    if (!point) {
      console.log(`  ✗ ${profile.nameRu}: адрес «${profile.addressRu}» не распознан`);
      continue;
    }

    await prisma.tenantProfile.update({
      where: { tenantId: profile.tenantId },
      data: { lat: point.lat, lng: point.lng },
    });
    filled += 1;
    console.log(`  ✓ ${profile.nameRu}: ${point.lat}, ${point.lng}`);

    await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  }

  console.log(`Готово: координаты у ${filled} из ${profiles.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
