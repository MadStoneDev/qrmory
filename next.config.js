module.exports = {
  async redirects() {
    return [
      // Permanent Redirects
      {
        source: "/signup",
        destination: "/auth/sign-up",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/auth/sign-up",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/sign-up",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },

      // Temporary Redirects
      {
        source: "/vcard",
        destination: "/",
        permanent: false, // Set to false for temporary redirects
      },
      {
        source: "/coupon",
        destination: "/",
        permanent: false, // Set to false for temporary redirects
      },
    ];
  },
};
