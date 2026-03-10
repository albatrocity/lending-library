import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const now = new Date();

const baseBorrowRequest = {
	id: 42,
	status: 'accepted',
	updatedAt: now,
	startDate: now,
	endDate: null,
	description: 'I need this item',
	user: { id: 'user-borrower', name: 'Alice' },
	item: { id: 1, name: 'Test Book' }
};

const pendingBorrow = { id: 10, status: 'pending' };
const activeBorrow = { id: 10, status: 'active' };

describe('lender view (isOutgoing: false)', () => {
	it('shows Mark as delivered button when request is accepted and borrow is pending', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: false, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: null
			}
		});
		await expect.element(page.getByRole('button', { name: 'Mark as delivered' })).toBeInTheDocument();
	});

	it('shows Item delivered and hides the button when borrow is active', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: false, borrowRequest: baseBorrowRequest, borrow: activeBorrow },
				form: null
			}
		});
		await expect.element(page.getByText('Item delivered.')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Mark as delivered' }))
			.not.toBeInTheDocument();
	});

	it('shows Item delivered and hides the button when form.delivered is true', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: false, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: { delivered: true }
			}
		});
		await expect.element(page.getByText('Item delivered.')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Mark as delivered' }))
			.not.toBeInTheDocument();
	});

	it('does not show Item delivered when form.delivered is absent', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: false, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: null
			}
		});
		await expect.element(page.getByText('Item delivered.')).not.toBeInTheDocument();
	});
});

describe('borrower view (isOutgoing: true)', () => {
	it('shows Mark as received button when request is accepted and borrow is pending', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: true, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: null
			}
		});
		await expect.element(page.getByRole('button', { name: 'Mark as received' })).toBeInTheDocument();
	});

	it('shows Item delivered and hides the button when borrow is active', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: true, borrowRequest: baseBorrowRequest, borrow: activeBorrow },
				form: null
			}
		});
		await expect.element(page.getByText('Item delivered.')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Mark as received' }))
			.not.toBeInTheDocument();
	});

	it('shows Item delivered and hides the button when form.delivered is true', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: true, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: { delivered: true }
			}
		});
		await expect.element(page.getByText('Item delivered.')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Mark as received' }))
			.not.toBeInTheDocument();
	});

	it('does not show Item delivered when form.delivered is absent', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: true, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: null
			}
		});
		await expect.element(page.getByText('Item delivered.')).not.toBeInTheDocument();
	});

	it('does not show Item delivered after a non-markReceived action succeeds', async () => {
		render(Page, {
			props: {
				data: { isOutgoing: true, borrowRequest: baseBorrowRequest, borrow: pendingBorrow },
				form: { success: true }
			}
		});
		await expect.element(page.getByText('Item delivered.')).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Mark as received' })).toBeInTheDocument();
	});
});
