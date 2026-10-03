import { NewsCard, SiteLink, T as BLOCK_T, mediaUrl } from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { Stars as RatingStars } from '@/components/site/sections';
import { CoverOr, EnrollLink, ThemeImage, aboutSection, developmentAreas, findSection } from '@/components/site/theme-kit';
import { pick } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';
import type { HomeProps } from '@/templates/types';
import { Ball, Cloud, CloudEdge, Icon, Puzzle, Rope, Stars, Sun, WavyArrow, routineIcon } from './Doodles';

const THEME = 'aspan';

const T = {
  welcome: { kk: 'Балалық шақтың әлеміне қош келдіңіздер!', ru: 'Добро пожаловать в мир детства!' },
  more: { kk: 'Толығырақ', ru: 'Подробнее' },
  games: { kk: 'Балалардың қабілетін дамытатын үйірмелер', ru: 'Кружки, которые развивают способности детей' },
  gamesLead: { kk: 'Қызықты сабақтар арқылы бала жаңа білім алып, өз қабілетін ашады.', ru: 'Через интересные занятия ребёнок узнаёт новое и раскрывает свои способности.' },
  allGames: { kk: 'Барлық үйірмелер', ru: 'Все кружки' },
  albums: { kk: 'Балабақшадағы қызықты сәттер', ru: 'Интересные моменты в детском саду' },
  albumsLead: { kk: 'Мерекелер, сабақтар мен серуендер — балалардың күнделікті өмірінен.', ru: 'Праздники, занятия и прогулки — из повседневной жизни детей.' },
  allAlbums: { kk: 'Барлық фото', ru: 'Все фото' },
  routine: { kk: 'Баланың жан-жақты дамуына арналған күн тәртібі', ru: 'Распорядок дня для всестороннего развития ребёнка' },
  routineLead: { kk: 'Әр күн ойын, сабақ, серуен мен демалыстың дұрыс кезектесуінен тұрады.', ru: 'Каждый день — правильное чередование игр, занятий, прогулок и отдыха.' },
  art: { kk: 'Шығармашылық пен талантты дамыту', ru: 'Развитие творчества и таланта' },
  artText: { kk: 'Сурет салу, мүсіндеу, жапсыру мен музыка — бала әлемді шығармашылық арқылы таниды және өз ойын батыл айтуға үйренеді.', ru: 'Рисование, лепка, аппликация и музыка — ребёнок познаёт мир через творчество и учится смело выражать свои мысли.' },
  enroll: { kk: 'Жазылу', ru: 'Записаться' },
  reviews: { kk: 'Ата-аналардың балабақша туралы пікірлері', ru: 'Отзывы родителей о детском саде' },
  lang: { kk: { kk: 'қазақ тобы', ru: 'казахская группа' }, ru: { kk: 'орыс тобы', ru: 'русская группа' } },
} as const;

const ICON_TONES = ['aspan-tone-yellow', 'aspan-tone-pink', 'aspan-tone-green'];
const FLAG_ICONS = ['bulb', 'game', 'shield'];
const GAME_IMAGES = ['build', 'sand', 'friends'];
const QUARTERS = ['read', 'hand', 'balls', 'ride'];

/**
 * Главная «Аспан» — вплотную к образцу №3: голубой первый экран (фото
 * в «бусах» из трёх овалов, нарисованная поляна с мальчиком, солнце
 * и три флажка-карточки на верёвке), круг из четырёх фото с пазлом
 * и три пункта, кремовая облачная полоса с круглыми фото, распорядок
 * вокруг фото в фигурной рамке, персиковая полоса творчества, отзыв
 * в жёлтом овале с фото, новости. Фото и рисунки — сгенерированные.
 */
export function AspanHome({ profile, news, albums, locale, coverUrl, coverPosition, hero, menu, clubs = [], groups = [], routine = [], reviews = [] }: HomeProps) {
  const about = aboutSection(menu);
  const clubsSection = findSection(menu, 'CLUBS');
  const gallerySection = findSection(menu, 'GALLERY');
  const aboutText = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const areas = developmentAreas(locale);
  const area = (key: string) => areas.find((item) => item.key === key)!;

  // Флажки — образовательные области ГОСО: это правда о любом саде.
  const flags = ['logic', 'health', 'art'].map(area);
  // Три пункта «Қош келдіңіздер» — группы сада, без групп — остальные области.
  const points = groups.length > 0
    ? groups.slice(0, 3).map((group) => ({
        key: group.id,
        title: pick(locale, group.nameKk, group.nameRu),
        text: [formatAgeRange(group.ageFrom, group.ageTo, locale), group.language === 'ru' ? T.lang.ru[locale] : T.lang.kk[locale]].filter(Boolean).join(', '),
      }))
    : ['speech', 'social'].map(area);
  // Кремовая полоса — кружки сада, без них — альбомы с настоящими обложками.
  const games = clubs.length > 0
    ? clubs.slice(0, 3).map((club, index) => ({ key: club.id, title: pick(locale, club.nameKk, club.nameRu), text: pick(locale, club.descKk, club.descRu), src: null as string | null, image: GAME_IMAGES[index % 3], href: clubsSection ? `/${clubsSection.slug}` : null }))
    : albums.slice(0, 3).map((album, index) => ({ key: album.id, title: pick(locale, album.titleKk, album.titleRu), text: '', src: mediaUrl(album.items[0]?.media), image: GAME_IMAGES[index % 3], href: `/${gallerySection?.slug ?? 'gallery'}/${album.slug}` }));
  const gamesLink = clubs.length > 0 ? (clubsSection ? `/${clubsSection.slug}` : null) : gallerySection ? `/${gallerySection.slug}` : null;
  const half = Math.ceil(Math.min(routine.length, 6) / 2);
  const routineLeft = routine.slice(0, half);
  const routineRight = routine.slice(half, 6);

  return (
    <div className="aspan-home">
      <section className="aspan-hero">
        <Cloud className="aspan-cloud aspan-cloud-1" />
        <Cloud className="aspan-cloud aspan-cloud-2" />
        <span className="aspan-ring" aria-hidden />
        <div className="container-page aspan-hero-top">
          <div className="aspan-hero-text">
            <HeroTitle hero={hero} tone="light" withEyebrow={false} className="aspan-h1" />
            {hero.lead ? <p className="aspan-lead">{hero.lead}</p> : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroButtons hero={hero} tone="light">
                <EnrollLink menu={menu} locale={locale} className="aspan-btn" />
              </HeroButtons>
            </div>
          </div>
          <span className="aspan-beads-wrap"><ThemeImage theme={THEME} name="kid" className="aspan-beads" sizes="(min-width: 1024px) 26vw, 70vw" eager /></span>
        </div>
        <div className="aspan-meadow">
          <ThemeImage theme={THEME} name="scene" className="aspan-scene" sizes="100vw" eager />
          <Sun className="aspan-sun" />
          <Rope className="aspan-rope" />
          <ul className="aspan-flags">
            {flags.map((flag, index) => (
              <li key={flag.key} className="aspan-flag">
                <span className={`aspan-flag-icon ${ICON_TONES[index % 3]}`}><Icon name={FLAG_ICONS[index % 3]} className="h-9 w-9" /></span>
                <b>{flag.title}</b>
                <span className="aspan-flag-go" aria-hidden><Icon name="arrow" className="h-4 w-4" /></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page aspan-welcome" aria-labelledby="aspan-welcome">
        <div className="aspan-quarters" aria-hidden>
          {QUARTERS.map((name) => <ThemeImage key={name} theme={THEME} name={name} sizes="(min-width: 1024px) 18vw, 45vw" />)}
          <span className="aspan-puzzle"><Puzzle /></span>
        </div>
        <div>
          <h2 id="aspan-welcome" className="aspan-title">{T.welcome[locale]}</h2>
          {aboutText ? <p className="aspan-text mt-4">{aboutText}</p> : null}
          <ul className="mt-6 space-y-5">
            {points.map((point, index) => (
              <li key={point.key} className="aspan-point">
                <span className={`aspan-point-icon ${ICON_TONES[index % 3]}`}><Icon name={['blocks', 'heart', 'leaf'][index % 3]} className="h-6 w-6" /></span>
                <span>
                  <b>{point.title}</b>
                  {point.text ? <span className="aspan-text block text-sm">{point.text}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          {about ? (
            <p className="mt-7 flex items-center justify-between gap-4">
              <WavyArrow className="hidden w-32 sm:block" />
              <SiteLink href={`/${about.slug}`} locale={locale} className="aspan-btn">{T.more[locale]}</SiteLink>
            </p>
          ) : null}
        </div>
      </section>

      {games.length > 0 ? (
        <section className="aspan-cream" aria-labelledby="aspan-games">
          <CloudEdge className="aspan-edge aspan-edge-top" />
          <div className="container-page py-14 text-center">
            <h2 id="aspan-games" className="aspan-title mx-auto max-w-3xl">{clubs.length > 0 ? T.games[locale] : T.albums[locale]}</h2>
            <p className="aspan-text mx-auto mt-4 max-w-2xl">{clubs.length > 0 ? T.gamesLead[locale] : T.albumsLead[locale]}</p>
            <ul className="aspan-games">
              {games.map((game) => {
                const inner = (
                  <>
                    {game.src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
                      <img src={game.src} alt="" className="aspan-game-photo" loading="lazy" />
                    ) : (
                      <ThemeImage theme={THEME} name={game.image} className="aspan-game-photo" sizes="12rem" />
                    )}
                    <span className="aspan-game-card">
                      <b>{game.title}</b>
                      {game.text ? <span>{game.text}</span> : null}
                    </span>
                  </>
                );
                return <li key={game.key}>{game.href ? <SiteLink href={game.href} locale={locale} className="block">{inner}</SiteLink> : inner}</li>;
              })}
            </ul>
            {gamesLink ? <SiteLink href={gamesLink} locale={locale} className="aspan-btn mt-10">{clubs.length > 0 ? T.allGames[locale] : T.allAlbums[locale]}</SiteLink> : null}
          </div>
          <CloudEdge className="aspan-edge aspan-edge-bottom" />
        </section>
      ) : null}

      {routine.length > 0 ? (
        <section className="container-page aspan-env" aria-labelledby="aspan-routine">
          <Stars className="aspan-stars" />
          <Ball className="aspan-ball" />
          <h2 id="aspan-routine" className="aspan-title mx-auto max-w-3xl text-center">{T.routine[locale]}</h2>
          <p className="aspan-text mx-auto mt-4 max-w-2xl text-center">{T.routineLead[locale]}</p>
          <div className="aspan-env-grid">
            <ul className="aspan-env-col aspan-env-left">
              {routineLeft.map((item, index) => (
                <li key={item.id}>
                  <span className="aspan-env-text"><b>{pick(locale, item.titleKk, item.titleRu)}</b><span>{item.time}</span></span>
                  <span className={`aspan-env-icon ${ICON_TONES[index % 3]}`}><Icon name={routineIcon(`${item.titleKk} ${item.titleRu}`)} className="h-7 w-7" /></span>
                </li>
              ))}
            </ul>
            <CoverOr coverUrl={coverUrl} coverPosition={coverPosition} theme={THEME} name="clay" className="aspan-arch" />
            <ul className="aspan-env-col aspan-env-right">
              {routineRight.map((item, index) => (
                <li key={item.id}>
                  <span className={`aspan-env-icon ${ICON_TONES[(index + 1) % 3]}`}><Icon name={routineIcon(`${item.titleKk} ${item.titleRu}`)} className="h-7 w-7" /></span>
                  <span className="aspan-env-text"><b>{pick(locale, item.titleKk, item.titleRu)}</b><span>{item.time}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="aspan-peach" aria-labelledby="aspan-art">
        <span className="aspan-blob aspan-blob-green" aria-hidden />
        <span className="aspan-blob aspan-blob-yellow" aria-hidden />
        <div className="container-page aspan-peach-inner">
          <ThemeImage theme={THEME} name="artist" className="aspan-artist" sizes="(min-width: 1024px) 38vw, 90vw" />
          <div className="relative">
            <h2 id="aspan-art" className="aspan-title aspan-violet">{T.art[locale]}</h2>
            <p className="mt-4 leading-relaxed">{T.artText[locale]}</p>
            <EnrollLink menu={menu} locale={locale} className="aspan-btn mt-7">{T.enroll[locale]}</EnrollLink>
          </div>
        </div>
        <CloudEdge className="aspan-edge aspan-edge-white" />
      </section>

      {reviews.length > 0 ? (
        <section className="container-page py-14" aria-labelledby="aspan-reviews">
          <h2 id="aspan-reviews" className="aspan-title aspan-orange mx-auto max-w-2xl text-center">{T.reviews[locale]}</h2>
          <ul className="aspan-reviews">
            {reviews.slice(0, 6).map((review) => (
              <li key={review.id} className="aspan-review">
                <figure>
                  <blockquote>{pick(locale, review.textKk, review.textRu)}</blockquote>
                  <figcaption>
                    <b className="block">{review.authorName}</b>
                    {pick(locale, review.authorNoteKk, review.authorNoteRu) ? <span className="block text-sm">{pick(locale, review.authorNoteKk, review.authorNoteRu)}</span> : null}
                    {review.rating ? <RatingStars rating={review.rating} locale={locale} /> : null}
                  </figcaption>
                </figure>
                <ThemeImage theme={THEME} name="dad" className="aspan-review-photo decor" sizes="(min-width: 1024px) 30vw, 60vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="container-page pb-6 pt-10" aria-labelledby="aspan-news">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="aspan-news" className="aspan-title">{BLOCK_T.news[locale]}</h2>
            <SiteLink href="/news" locale={locale} className="aspan-more">{BLOCK_T.allNews[locale]} →</SiteLink>
          </div>
          <div className="aspan-news mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
