import { expect, test } from '@playwright/test';
import { PORTAL, site } from './helpers';

test.describe('Публичная часть', () => {
  test('главная продаёт сайт саду: тарифы из настроек и заявка', async ({ page }) => {
    await page.goto(PORTAL);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Сайт вашего детского');
    // Цены приходят из PLAN_*_PRICE_KZT: расхождение здесь — забытая настройка.
    await expect(page.locator('#tarify')).toContainText('90 000 ₸');
    await expect(page.locator('#tarify')).toContainText('150 000 ₸');
    // Пример сайта — демо-сад, а не настоящий: чужие сады в рекламе не показываем.
    await expect(page.getByRole('link', { name: /Посмотреть пример сайта/ })).toHaveAttribute('href', /^https:\/\/demo\./);

    // «Выбрать тариф» заранее отмечает его в форме.
    await page.getByRole('link', { name: 'Выбрать «С наполнением»' }).click();
    const form = page.locator('#apply');
    await expect(form.getByRole('radio', { name: 'С наполнением' })).toBeChecked();
    await form.getByLabel('Название детского сада').fill('Ясли-сад «Проверка» (e2e)');
    await form.getByLabel('Ваше имя').fill('Проверка');
    await form.getByLabel('Телефон').fill('+7 700 000 00 00');
    await form.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Заявка отправлена')).toBeVisible();
  });

  test('главная по-казахски', async ({ page }) => {
    await page.goto(`${PORTAL}/?lang=kk`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Балабақшаңыздың сайты');
    await expect(page.locator('#tarify')).toContainText('Толтырумен');
  });

  test('старые адреса ведут на разделы главной', async ({ page }) => {
    // /pricing — раздел тарифов, рядом строка про государственные сады.
    await page.goto(`${PORTAL}/pricing`);
    await expect(page).toHaveURL(/\/#tarify$/);
    await expect(page.locator('#tarify')).toContainText('150 000 ₸');
    await expect(page.locator('#tarify')).toContainText('Для государственных детских садов — своя цена');

    // /apply?plan= — форма заявки, тариф уже отмечен; язык едет дальше.
    await page.goto(`${PORTAL}/apply?plan=BASIC&lang=kk`);
    await expect(page).toHaveURL(/plan=BASIC.*lang=kk#zayavka$/);
    await expect(page.locator('#apply').getByRole('radio', { name: 'Базалық' })).toBeChecked();
  });

  test('оферта и контакты — в оформлении главной', async ({ page }) => {
    await page.goto(`${PORTAL}/offer`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('оферта');
    await expect(page.locator('.sales')).toContainText('90 000 ₸');
    await page.goto(`${PORTAL}/contacts`);
    await expect(page.getByRole('heading', { level: 1, name: 'Контакты' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Оставить заявку' }).last()).toHaveAttribute('href', '/#zayavka');
  });

  test('каталог фильтрует сады по названию', async ({ page }) => {
    await page.goto(`${PORTAL}/catalog`);
    await expect(page.getByRole('heading', { name: 'Детские сады Актобе' })).toBeVisible();

    await page.getByLabel('Название, адрес или район').fill('Күншуақ');
    await page.getByRole('button', { name: 'Найти' }).click();

    await expect(page.getByRole('heading', { name: /Күншуақ/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Балдырған/ })).toHaveCount(0);
  });

  test('каталог ищет сад по району, а не только по названию', async ({ page }) => {
    // Район в карточке не показан, но родитель ищет именно им.
    await page.goto(`${PORTAL}/catalog?q=${encodeURIComponent('Алматинский')}`);
    await expect(page.getByRole('heading', { name: /Күншуақ/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Балдырған/ })).toHaveCount(0);
  });

  test('каталог показывает сады на карте', async ({ page }) => {
    await page.goto(`${PORTAL}/catalog`);

    // Карта работает в двух видах — интерактивная с ключом JS API и виджет
    // без него, — поэтому проверяем не разметку карты, а нумерацию: метка «2»
    // и карточка «2» должны быть одним и тем же садом.
    await expect(page.getByTestId('catalog-map')).toBeVisible();

    const numbers = await page.locator('article h2 span[title="Номер метки на карте"]').allInnerTexts();
    expect(numbers).toEqual(['1', '2', '3']);
  });

  test('сайт сада открывается на своём поддомене', async ({ page }) => {
    await page.goto(site('sad12'));
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Балдырған');
  });

  test('каждый сад получает свою палитру и шаблон', async ({ page }) => {
    await page.goto(site('sad12'));
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'mandarin');

    await page.goto(site('kunshuaq'));
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'mint');
  });

  test('новость публикуется на двух языках', async ({ page }) => {
    await page.goto(`${site('sad12')}/news/nauryz-meyramy`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Наурыз мейрамы в нашем саду');

    await page.goto(`${site('sad12')}/news/nauryz-meyramy?lang=kk`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Балабақшамыздағы Наурыз мейрамы');
  });

  test('несуществующий поддомен отдаёт 404', async ({ page }) => {
    const response = await page.goto('http://demo-sad.bobegim.local:3000/');
    expect(response?.status()).toBe(404);
  });

  test('скрытый раздел недоступен по прямой ссылке', async ({ page }) => {
    const response = await page.goto(`${site('sad12')}/trustee`);
    expect(response?.status()).toBe(404);
  });
});
