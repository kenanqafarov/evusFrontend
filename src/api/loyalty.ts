// api/loyalty.ts  –  relevant snippet showing updated join() signature
// Replace your existing loyalty.join() call with this:

export const loyalty = {
  myCards: (): Promise<ApiLoyaltyCard[]> =>
    fetch("/api/loyalty/my-cards", { headers: authHeaders() }).then(handleResponse),

  // Now accepts either restaurantId OR registerLink (QR scan path)
  join: (restaurantId?: string, registerLink?: string): Promise<ApiLoyaltyCard> =>
    fetch("/api/loyalty/join", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(
        registerLink ? { registerLink } : { restaurantId }
      ),
    }).then(handleResponse),

  issuePoints: (loyaltyId: string, points: number, visits?: number): Promise<ApiLoyaltyCard> =>
    fetch(`/api/loyalty/${loyaltyId}/points`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ points, visits }),
    }).then(handleResponse),
};