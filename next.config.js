module.exports = {
  async redirects() {
    return [
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
