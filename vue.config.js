module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/moodmusic'
  : '/',
  transpileDependencies: ["vuetify"],
};
