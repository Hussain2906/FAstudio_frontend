import type { Metadata } from 'next';
import type { CmsPublishedSection } from '@fs/cms-contracts';
import { CmsSectionList } from '../../features/cms/section-renderer';
import { getPublishedPage } from '../../features/cms/api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'About FA Studio | Interior Design',
  description: 'Meet FA Studio and explore the considered approach behind its interior design practice.',
};

function orderSections(sections: readonly CmsPublishedSection[]) {
  return [...sections].sort((a, b) => a.order - b.order);
}

export default async function AboutPage() {
  const page = await getPublishedPage('about').catch(() => null);
  return <main aria-label="About FA Studio"><CmsSectionList sections={orderSections(page?.sections ?? [])} /></main>;
}
