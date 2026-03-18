import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

describe('App', () => {
    it('renders app layout with navigation', () => {
        // Mock fetch for API and auth so app renders without network
        global.fetch = vi.fn((url) => {
            const u = typeof url === 'string' ? url : url?.url || '';
            const json = () => {
                if (u.includes('health')) return Promise.resolve({ status: 'ok', message: 'Test', timestamp: 'now' });
                if (u.includes('auth/me')) return Promise.resolve({}).then(() => ({ user: null })); // no user
                return Promise.resolve({ products: [], total: 0 });
            };
            return Promise.resolve({ ok: true, json });
        });

        render(<App />);
        // App shows nav with brand or main nav links
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        const brandLinks = screen.getAllByRole('link', { name: /ATELIER/i });
        expect(brandLinks.length).toBeGreaterThan(0);
    });
});
