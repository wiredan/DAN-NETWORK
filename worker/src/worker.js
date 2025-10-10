export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hello") {
      return new Response("Worker backend running ✅", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};