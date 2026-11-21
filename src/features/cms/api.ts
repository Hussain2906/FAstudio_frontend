import type { CmsPublishedPage } from '@fs/cms-contracts';
import { apiClient } from '../../lib/api/client';

export const getPublishedPage = (slug: string) => apiClient.get<CmsPublishedPage>(`cms/public/pages/${encodeURIComponent(slug)}`);
