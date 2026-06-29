import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// next/headers and next/navigation must be mocked before importing the module under test
vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue(new Headers()),
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
	redirect: mockRedirect,
}));

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

// Import after mocks are in place
const { getCurrentUser, requireUser } = await import("@/lib/auth/session");

const fakeUser = {
	id: "user-1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	image: null,
};

describe("getCurrentUser", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when getSession returns null", async () => {
		mockGetSession.mockResolvedValue(null);
		const result = await getCurrentUser();
		expect(result).toBeNull();
	});

	it("returns the user when a session exists", async () => {
		mockGetSession.mockResolvedValue({ session: {}, user: fakeUser });
		const result = await getCurrentUser();
		expect(result).toEqual(fakeUser);
	});

	it("returns null when getSession throws", async () => {
		mockGetSession.mockRejectedValue(new Error("network error"));
		const result = await getCurrentUser();
		expect(result).toBeNull();
	});
});

describe("requireUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls redirect('/') when there is no session", async () => {
		mockGetSession.mockResolvedValue(null);
		await requireUser();
		expect(mockRedirect).toHaveBeenCalledWith("/");
	});

	it("returns the user when authenticated", async () => {
		mockGetSession.mockResolvedValue({ session: {}, user: fakeUser });
		const result = await requireUser();
		expect(result).toEqual(fakeUser);
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});
