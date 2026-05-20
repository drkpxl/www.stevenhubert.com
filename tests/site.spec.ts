import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const WORK_DIR = join(process.cwd(), 'src/content/work');

function workSlugs(): string[] {
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

function workSlugsWithVideo(): string[] {
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .filter((f) => {
      const body = readFileSync(join(WORK_DIR, f), 'utf8');
      return /<Video\s|{%\s*video/.test(body);
    })
    .map((f) => f.replace(/\.mdx?$/, ''));
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('home', () => {
  test('loads with h1, intro, and LinkedIn link', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    const linkedIn = page.locator('a[href*="linkedin.com"]').first();
    await expect(linkedIn).toBeVisible();
    await expect(linkedIn).toHaveAttribute('rel', /noopener/);
    expect(errors).toEqual([]);
  });

  test('shows no more than 4 featured cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.featured .work-card');
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(4);
  });
});

test.describe('work index', () => {
  test('loads and renders one card per entry', async ({ page }) => {
    const response = await page.goto('/work/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toContainText('Work');
    const cards = page.locator('.work-card');
    await expect(cards).toHaveCount(workSlugs().length);
  });
});

test.describe('every work page renders', () => {
  for (const slug of workSlugs()) {
    test(`/work/${slug}/`, async ({ page }) => {
      const response = await page.goto(`/work/${slug}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-layout="work"]')).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
    });
  }
});

test.describe('no broken images', () => {
  const pages = ['/', '/work/'];

  for (const path of pages) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const broken = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src);
      });
      expect(broken, `Broken images on ${path}:\n${broken.join('\n')}`).toEqual([]);
    });
  }

  test('first work page', async ({ page }) => {
    const slug = workSlugs()[0];
    test.skip(!slug, 'no work content present');
    await page.goto(`/work/${slug}/`);
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src);
    });
    expect(broken).toEqual([]);
  });
});

test.describe('video player', () => {
  const slugs = workSlugsWithVideo();

  if (slugs.length === 0) {
    test.skip('no work pages contain videos yet', () => {});
  }

  for (const slug of slugs) {
    test(`/work/${slug}/ video plays`, async ({ page, request, baseURL }) => {
      await page.goto(`/work/${slug}/`);
      const videos = page.locator('video');
      const count = await videos.count();
      expect(count).toBeGreaterThan(0);

      const refs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('video')).map((v) => {
          const source = v.querySelector('source');
          return {
            poster: v.getAttribute('poster'),
            src: source?.getAttribute('src') ?? null,
          };
        });
      });

      for (const { poster, src } of refs) {
        expect(src, 'video has a <source src>').toBeTruthy();
        expect(poster, 'video has a poster').toBeTruthy();
        const posterUrl = new URL(poster!, baseURL!).toString();
        const srcUrl = new URL(src!, baseURL!).toString();
        const posterResp = await request.fetch(posterUrl, { method: 'HEAD' });
        expect(posterResp.status(), `poster ${posterUrl}`).toBe(200);
        const srcResp = await request.fetch(srcUrl, { method: 'HEAD' });
        expect(srcResp.status(), `video src ${srcUrl}`).toBe(200);
      }

      const readyStates = await page.evaluate(async () => {
        const vids = Array.from(document.querySelectorAll('video'));
        await Promise.all(
          vids.map(
            (v) =>
              new Promise<void>((resolve) => {
                if (v.readyState >= 1) return resolve();
                v.addEventListener('loadedmetadata', () => resolve(), { once: true });
                v.addEventListener('error', () => resolve(), { once: true });
                setTimeout(() => resolve(), 8000);
              }),
          ),
        );
        return vids.map((v) => v.readyState);
      });
      for (const state of readyStates) {
        expect(state, 'video readyState >= HAVE_METADATA').toBeGreaterThanOrEqual(1);
      }
    });
  }
});

test.describe('console hygiene', () => {
  const pages = ['/', '/work/', `/work/${workSlugs()[0] ?? 'stub'}/`];
  for (const path of pages) {
    test(`no console errors on ${path}`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});

test.describe('mobile layout', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 600, 'mobile-only assertion');

  for (const path of ['/', '/work/', `/work/${workSlugs()[0] ?? 'stub'}/`]) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    });
  }
});
