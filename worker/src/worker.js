export default {
  async fetch(request, env) {
    const jwtSecret = env.JWT_SECRET;
    const geminiKey = env.GEMINI_API_KEY;

    return new Response(`JWT Secret length: ${jwtSecret.length}`, { status: 200 });
  },
};