'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { audit } from '@/server/audit';
import { createTenant, ProvisionError } from '@/server/tenant/provision';
import { invalidateTenantCacheById } from '@/server/tenant/resolve';
import { generatePassword, hashPassword } from '@/server/auth/password';
import { destroyAllSessions, createSession, requestMeta } from '@/server/auth/session';
import { extendSubscription } from '@/server/subscription';
import { isTemplateCode, isPaletteCode } from '@/lib/templates';
import { env } from '@/lib/env';
import { normalizeHost } from '@/lib/host';
import { redirect } from 'next/navigation';
import { promises as dns } from 'node:dns';
import { headers } from 'next/headers';
import type { TenantKind, TenantStatus } from '@prisma/client';

const createSchema = z.object({
  nameRu: z.string().trim().min(2, 'Укажите название по-русски').max(200),
  nameKk: z.string().trim().min(2, 'Укажите название по-казахски').max(200),
  slug: z.string().trim().min(3, 'Адрес слишком короткий').max(32),
  kind: z.enum(['NURSERY_GARDEN', 'KINDERGARTEN', 'MINI_CENTER', 'PRIVATE', 'FAMILY']),
  isPrivate: z.boolean(),
  district: z.string().trim().max(120).optional(),
  addressRu: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(60).optional(),
  email: z.string().trim().max(160).optional(),
  templateCode: z.string().refine(isTemplateCode, 'Выберите шаблон'),
  palette: z.string().refine(isPaletteCode, 'Выберите палитру'),
  adminFullName: z.string().trim().min(2, 'Укажите ФИО администратора').max(160),
  adminLogin: z
    .string()
    .trim()
    .min(3, 'Логин слишком короткий')
    .max(40)
    .regex(/^[a-z0-9._-]+$/i, 'Логин: латинские буквы, цифры, точка, дефис и подчёркивание'),
  adminPhone: z.string().trim().max(60).optional(),
});

export type CreateTenantState = {
  errors?: Record<string, string>;
  message?: string;
  /** Заполняется один раз после успешного создания — это и есть памятка доступа. */
  created?: {
    tenantId: string;
    siteUrl: string;
    adminUrl: string;
    login: string;
    password: string;
    nameRu: string;
  };
};

export async function createTenantAction(
  _prev: CreateTenantState,
  formData: FormData,
): Promise<CreateTenantState> {
  const admin = await requireSuperadmin();
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { message: (error as Error).message };
  }

  const parsed = createSchema.safeParse({
    nameRu: formData.get('nameRu'),
    nameKk: formData.get('nameKk'),
    slug: formData.get('slug'),
    kind: formData.get('kind'),
    isPrivate: formData.get('isPrivate') === 'on',
    district: formData.get('district') ?? undefined,
    addressRu: formData.get('addressRu') ?? undefined,
    phone: formData.get('phone') ?? undefined,
    email: formData.get('email') ?? undefined,
    templateCode: formData.get('templateCode'),
    palette: formData.get('palette'),
    adminFullName: formData.get('adminFullName'),
    adminLogin: formData.get('adminLogin'),
    adminPhone: formData.get('adminPhone') ?? undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message;
    }
    return { errors, message: 'Проверьте заполнение формы.' };
  }

  try {
    const result = await createTenant({
      ...parsed.data,
      kind: parsed.data.kind as TenantKind,
      district: parsed.data.district || null,
      addressRu: parsed.data.addressRu || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      adminPhone: parsed.data.adminPhone || null,
    });

    await audit(admin, 'tenant.create', {
      tenantId: result.tenantId,
      entity: 'tenant',
      entityId: result.tenantId,
      meta: { slug: result.slug, login: result.login },
    });

    revalidatePath('/admin/tenants');

    return {
      created: {
        tenantId: result.tenantId,
        siteUrl: result.siteUrl,
        adminUrl: result.adminUrl,
        login: result.login,
        password: result.password,
        nameRu: parsed.data.nameRu,
      },
    };
  } catch (error) {
    if (error instanceof ProvisionError) return { message: error.message };
    console.error('[tenant.create]', error);
    return { message: 'Не удалось создать сад. Проверьте данные и попробуйте ещё раз.' };
  }
}

export async function setTenantStatus(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const tenantId = String(formData.get('tenantId'));
  const status = String(formData.get('status')) as TenantStatus;

  if (!['DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
    throw new Error('Неизвестный статус');
  }

  await prisma.tenant.update({ where: { id: tenantId }, data: { status } });
  await invalidateTenantCacheById(tenantId);
  await audit(admin, 'tenant.status_change', { tenantId, entity: 'tenant', entityId: tenantId, meta: { status } });

  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath('/admin/tenants');
}

export async function resetUserPassword(formData: FormData): Promise<void> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const userId = String(formData.get('userId'));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Пользователь не найден');

  const password = generatePassword();
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
  // Старые сессии больше недействительны — иначе сброс пароля никого не выкидывает.
  await destroyAllSessions(userId);

  await audit(admin, 'user.reset_password', {
    tenantId: user.tenantId,
    entity: 'user',
    entityId: userId,
    meta: { login: user.login },
  });

  // Новый пароль показывается один раз — передаём его через одноразовый параметр адреса.
  redirect(`/admin/users?reset=${encodeURIComponent(user.login)}&password=${encodeURIComponent(password)}`);
}

export async function toggleUserActive(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const userId = String(formData.get('userId'));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Пользователь не найден');

  const isActive = !user.isActive;
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  if (!isActive) await destroyAllSessions(userId);

  await audit(admin, isActive ? 'user.activate' : 'user.deactivate', {
    tenantId: user.tenantId,
    entity: 'user',
    entityId: userId,
    meta: { login: user.login },
  });

  revalidatePath('/admin/users');
}

const userSchema = z.object({
  tenantId: z.string().min(1, 'Выберите сад'),
  fullName: z.string().trim().min(2, 'Укажите ФИО').max(160),
  login: z.string().trim().min(3).max(40).regex(/^[a-z0-9._-]+$/i, 'Недопустимые символы в логине'),
  role: z.enum(['TENANT_ADMIN', 'TENANT_EDITOR']),
  phone: z.string().trim().max(60).optional(),
});

export type CreateUserState = {
  errors?: Record<string, string>;
  message?: string;
  created?: { login: string; password: string };
};

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const admin = await requireSuperadmin();
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { message: (error as Error).message };
  }

  const parsed = userSchema.safeParse({
    tenantId: formData.get('tenantId'),
    fullName: formData.get('fullName'),
    login: formData.get('login'),
    role: formData.get('role'),
    phone: formData.get('phone') ?? undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message;
    }
    return { errors, message: 'Проверьте заполнение формы.' };
  }

  const login = parsed.data.login.toLowerCase();
  if (await prisma.user.findUnique({ where: { login }, select: { id: true } })) {
    return { errors: { login: 'Такой логин уже занят' } };
  }

  const password = generatePassword();
  const user = await prisma.user.create({
    data: {
      login,
      passwordHash: await hashPassword(password),
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      tenantId: parsed.data.tenantId,
      mustChangePassword: true,
    },
  });

  await audit(admin, 'user.create', {
    tenantId: parsed.data.tenantId,
    entity: 'user',
    entityId: user.id,
    meta: { login, role: parsed.data.role },
  });

  revalidatePath('/admin/users');
  return { created: { login, password } };
}

export async function recordPayment(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const tenantId = String(formData.get('tenantId'));
  const amount = Number.parseInt(String(formData.get('amount') ?? env.subscriptionPrice), 10);
  const method = String(formData.get('method') ?? 'kaspi');
  const invoiceNo = String(formData.get('invoiceNo') ?? '').trim() || null;
  const months = Number.parseInt(String(formData.get('months') ?? '12'), 10);

  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Некорректная сумма');

  const periodEnd = await extendSubscription(tenantId, Number.isFinite(months) ? months : 12);

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });

  await prisma.payment.create({
    data: {
      tenantId,
      subscriptionId: subscription?.id ?? null,
      amount,
      paidAt: new Date(),
      method,
      invoiceNo,
    },
  });

  // Оплата снимает приостановку: сад снова может работать.
  await prisma.tenant.updateMany({
    where: { id: tenantId, status: 'SUSPENDED' },
    data: { status: 'ACTIVE' },
  });
  await invalidateTenantCacheById(tenantId);

  await audit(admin, 'payment.record', {
    tenantId,
    entity: 'subscription',
    meta: { amount, method, invoiceNo, periodEnd: periodEnd.toISOString() },
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath('/admin/subscriptions');
}

export async function addDomain(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const tenantId = String(formData.get('tenantId'));
  const host = normalizeHost(String(formData.get('host') ?? ''));

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) throw new Error('Некорректное доменное имя');
  if (host.endsWith(`.${env.portalDomain}`) || host === env.portalDomain) {
    throw new Error('Поддомены портала выдаются автоматически — здесь добавляются только собственные домены сада.');
  }
  if (await prisma.domain.findUnique({ where: { host }, select: { id: true } })) {
    throw new Error('Этот домен уже подключён');
  }

  await prisma.domain.create({ data: { tenantId, host, type: 'CUSTOM', certStatus: 'PENDING' } });
  await audit(admin, 'domain.add', { tenantId, entity: 'domain', meta: { host } });

  revalidatePath(`/admin/tenants/${tenantId}`);
}

/**
 * Проверка A-записи. Сертификат выпустит Caddy сам, когда домен окажется в списке
 * разрешённых, — здесь мы только подтверждаем, что DNS уже указывает на нас.
 */
export async function verifyDomain(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const domainId = String(formData.get('domainId'));
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw new Error('Домен не найден');

  const expected = (process.env.SERVER_IPV4 ?? '').trim();
  let certStatus: 'DNS_OK' | 'FAILED' = 'FAILED';
  let lastError: string | null = null;

  try {
    const records = await dns.resolve4(domain.host);
    if (!expected) {
      certStatus = records.length > 0 ? 'DNS_OK' : 'FAILED';
      lastError = expected ? null : 'SERVER_IPV4 не задан — проверено только наличие A-записи';
    } else if (records.includes(expected)) {
      certStatus = 'DNS_OK';
    } else {
      lastError = `A-запись указывает на ${records.join(', ') || 'ничего'}, ожидается ${expected}`;
    }
  } catch (error) {
    lastError = `DNS не отвечает: ${(error as Error).message}`;
  }

  await prisma.domain.update({
    where: { id: domainId },
    data: { certStatus, lastError, verifiedAt: certStatus === 'DNS_OK' ? new Date() : null },
  });
  await invalidateTenantCacheById(domain.tenantId);
  await audit(admin, 'domain.verify', {
    tenantId: domain.tenantId,
    entity: 'domain',
    entityId: domainId,
    meta: { host: domain.host, certStatus, lastError },
  });

  revalidatePath(`/admin/tenants/${domain.tenantId}`);
}

export async function setPrimaryDomain(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const domainId = String(formData.get('domainId'));
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw new Error('Домен не найден');

  await prisma.$transaction([
    prisma.domain.updateMany({ where: { tenantId: domain.tenantId }, data: { isPrimary: false } }),
    prisma.domain.update({ where: { id: domainId }, data: { isPrimary: true } }),
  ]);
  await invalidateTenantCacheById(domain.tenantId);
  await audit(admin, 'domain.set_primary', {
    tenantId: domain.tenantId,
    entity: 'domain',
    entityId: domainId,
    meta: { host: domain.host },
  });

  revalidatePath(`/admin/tenants/${domain.tenantId}`);
}

export async function deleteDomain(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const domainId = String(formData.get('domainId'));
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw new Error('Домен не найден');
  if (domain.type === 'SUBDOMAIN') throw new Error('Основной поддомен сада удалить нельзя');

  await prisma.domain.delete({ where: { id: domainId } });
  await invalidateTenantCacheById(domain.tenantId);
  await audit(admin, 'domain.delete', { tenantId: domain.tenantId, meta: { host: domain.host } });

  revalidatePath(`/admin/tenants/${domain.tenantId}`);
}

/** «Войти как сад»: выдаёт сессию администратора сада с пометкой, кто её открыл. */
export async function impersonate(formData: FormData) {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const tenantId = String(formData.get('tenantId'));
  const target = await prisma.user.findFirst({
    where: { tenantId, role: 'TENANT_ADMIN', isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!target) throw new Error('У этого сада нет активного администратора');

  const domain = await prisma.domain.findFirst({
    where: { tenantId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  if (!domain) throw new Error('У этого сада нет ни одного домена');

  const { ip, userAgent } = await requestMeta();
  // Cookie не ставим: она осталась бы на домене портала, а работать будут на домене сада.
  // Токен уходит одноразовой ссылкой, которую /admin/enter обменивает на cookie.
  const token = await createSession(target.id, {
    ip,
    userAgent,
    impersonatedBy: admin.id,
    setCookie: false,
  });

  await audit(admin, 'tenant.impersonate', {
    tenantId,
    entity: 'user',
    entityId: target.id,
    meta: { login: target.login, host: domain.host },
  });

  const proto = env.cookieSecure ? 'https' : 'http';
  // Переносим нестандартный порт с текущего адреса: в проде его нет, а при локальном
  // запуске без него ссылка ведёт на :80 и браузер не достучится.
  const port = (await headers()).get('host')?.split(':')[1];
  const targetHost = port ? `${domain.host}:${port}` : domain.host;

  redirect(`${proto}://${targetHost}/admin/enter?t=${encodeURIComponent(token)}`);
}
