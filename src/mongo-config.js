function mongoUri(uri = process.env.MONGO_URL, password = process.env.MONGODB_PASSWORD) {
  if (!uri) throw new Error('Falta MONGO_URL');
  if (!password) return uri;
  const parsed = new URL(uri);
  if (!parsed.username) throw new Error('Incluye el usuario MongoDB en MONGO_URL');
  parsed.password = encodeURIComponent(password);
  return parsed.toString();
}
module.exports = { mongoUri };

