import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { RouteLoadingScreen } from '@/components/layout/route-loading';

// React Router data mode: the route tree is data, pages stay thin.
// Every page is loaded on demand so the entry chunk only carries the shell and
// the route the user actually opened.
export const router = createBrowserRouter([
	{
		path: '/',
		Component: AppLayout,
		HydrateFallback: RouteLoadingScreen,
		children: [
			{
				index: true,
				lazy: async () => ({ Component: (await import('@/pages/home-page')).HomePage })
			},
			{
				path: 'analizar',
				lazy: async () => ({ Component: (await import('@/pages/analyze-page')).AnalyzePage })
			},
			{
				path: 'buscar',
				lazy: async () => ({ Component: (await import('@/pages/search-page')).SearchPage })
			},
			{
				path: 'contenidos',
				lazy: async () => ({ Component: (await import('@/pages/contents-page')).ContentsPage })
			},
			{
				path: 'contenidos/:id',
				lazy: async () => ({ Component: (await import('@/pages/content-detail-page')).ContentDetailPage })
			},
			{
				path: 'lote',
				lazy: async () => ({ Component: (await import('@/pages/batch-page')).BatchPage })
			},
			{
				path: 'mapa',
				lazy: async () => ({ Component: (await import('@/pages/map-page')).MapPage })
			},
			{
				path: '*',
				lazy: async () => ({ Component: (await import('@/pages/not-found-page')).NotFoundPage })
			}
		]
	}
]);
