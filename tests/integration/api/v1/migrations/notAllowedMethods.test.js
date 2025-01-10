const notAllowedMethods = ["PUT", "PATCH", "DELETE"];

for (const method of notAllowedMethods) {
  test(`${method} to /api/v1/migrations should return 405`, async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method,
    });

    expect(response.status).toBe(405);
  });
}
