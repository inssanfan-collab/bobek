import 'server-only';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { subdomainFor, isValidSlug } from '@/lib/host';
import { DEFAULT_SECTIONS } from '@/lib/sections';
import { generatePassword, hashPassword } from '@/server/auth/password';
import { invalidateTenantCache } from './resolve';
import type { TenantKind } from '@prisma/client';

export type CreateTenantInput = {
  slug: string;
  nameKk: string;
  nameRu: string;
  kind: TenantKind;
  isPrivate: boolean;
  district?: string | null;
  addressRu?: string | null;
  phone?: string | null;
  email?: string | null;
  templateCode: string;
  palette: string;
  adminFullName: string;
  adminLogin: string;
  adminPhone?: string | null;
};

export type CreateTenantResult = {
  tenantId: string;
  slug: string;
  siteUrl: string;
  adminUrl: string;
  login: string;
  /** Показывается один раз — в памятке доступа. В базе только хеш. */
  password: string;
};

export class ProvisionError extends Error {}

/**
 * Создание сада одной транзакцией: сам сад, паспорт, поддомен, стандартные разделы,
 * учётная запись администратора и подписка на год.
 * Частично созданный сад хуже, чем несозданный, поэтому всё или ничего.
 */
export async function createTenant(input: CreateTenantInput): Promise<CreateTenantResult> {
  const slug = input.slug.trim().toLowerCase();

  if (!isValidSlug(slug)) {
    throw new ProvisionError(
      'Адрес сада может содержать латинские буквы, цифры и дефис (3–32 символа) и не должен совпадать со служебными именами.',
    );
  }

  const host = subdomainFor(slug, env.portalDomain);
  const login = input.adminLogin.trim().toLowerCase();

  const [slugTaken, hostTaken, loginTaken] = await Promise.all([
    prisma.tenant.findUnique({ where: { slug }, select: { id: true } }),
    prisma.domain.findUnique({ where: { host }, select: { id: true } }),
    prisma.user.findUnique({ where: { login }, select: { id: true } }),
  ]);

  if (slugTaken || hostTaken) throw new ProvisionError(`Адрес ${host} уже занят другим садом.`);
  if (loginTaken) throw new ProvisionError(`Логин «${login}» уже используется.`);

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const tenantId = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        slug,
        status: 'DRAFT',
        templateCode: input.templateCode,
        palette: input.palette,
        profile: {
          create: {
            nameKk: input.nameKk.trim(),
            nameRu: input.nameRu.trim(),
            kind: input.kind,
            isPrivate: input.isPrivate,
            district: input.district?.trim() || null,
            addressRu: input.addressRu?.trim() || null,
            phone: input.phone?.trim() || null,
            email: input.email?.trim() || null,
          },
        },
        domains: {
          create: { host, type: 'SUBDOMAIN', isPrimary: true, certStatus: 'ACTIVE', verifiedAt: new Date() },
        },
        users: {
          create: {
            login,
            passwordHash,
            fullName: input.adminFullName.trim(),
            phone: input.adminPhone?.trim() || null,
            role: 'TENANT_ADMIN',
            mustChangePassword: true,
          },
        },
        subscriptions: {
          create: { periodStart, periodEnd, amount: env.subscriptionPrice, isCurrent: true },
        },
      },
      select: { id: true },
    });

    await tx.section.createMany({
      data: DEFAULT_SECTIONS.map((section, index) => ({
        tenantId: tenant.id,
        type: section.type,
        slug: section.slug,
        titleKk: section.titleKk,
        titleRu: section.titleRu,
        position: index,
        isVisible: true,
      })),
    });

    // Страницы «О саде» и «Родителям» — контейнеры для текста, создаём сразу пустыми,
    // чтобы в админке не было шага «сначала создайте страницу».
    const pageSections = await tx.section.findMany({
      where: { tenantId: tenant.id, type: 'PAGE' },
      select: { id: true },
    });
    if (pageSections.length) {
      await tx.page.createMany({
        data: pageSections.map((s) => ({ tenantId: tenant.id, sectionId: s.id })),
      });
    }

    return tenant.id;
  });

  invalidateTenantCache(host);

  return {
    tenantId,
    slug,
    siteUrl: `https://${host}`,
    adminUrl: `https://${host}/admin`,
    login,
    password,
  };
}

/** Предлагает свободный адрес поддомена по названию сада. */
export async function suggestSlug(base: string): Promise<string> {
  const { slugify } = await import('@/lib/slug');
  const root = slugify(base).slice(0, 24) || 'balabaqsha';

  for (const candidate of [root, ...Array.from({ length: 50 }, (_, i) => `${root}-${i + 2}`)]) {
    if (!isValidSlug(candidate)) continue;
    const exists = await prisma.tenant.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  return `${root}-${Date.now().toString(36).slice(-4)}`;
}
