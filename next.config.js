module.exports = {
  async redirects() {
    return [
      {
        source: "/sign-up",
        destination: "/auth/sign-up",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      // Add more redirects as needed
    ];
  },
};
