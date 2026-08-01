export async function onRequestGet(context) {
    const { env } = context;
    
    if (!env || !env.DB) {
        return new Response(JSON.stringify({ 
            success: true, 
            posts: [],
            message: "D1 Database binding 'DB' not configured."
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { results } = await env.DB.prepare(
            `SELECT p.id, p.title, p.author, p.content, COALESCE(p.views, 0) AS views, p.created_at, 
                    COUNT(c.id) AS comment_count 
             FROM posts p 
             LEFT JOIN comments c ON ('community-' || p.id) = c.post_id 
             GROUP BY p.id 
             ORDER BY p.id DESC`
        ).all();

        return new Response(JSON.stringify({ success: true, posts: results }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { title, author, content, password } = body;

        if (!title || !author || !content || !password) {
            return new Response(JSON.stringify({ success: false, error: "Missing required fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env || !env.DB) {
            return new Response(JSON.stringify({ 
                success: true, 
                post: { id: Date.now(), title, author, content, views: 1, created_at: new Date().toISOString() }
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const info = await env.DB.prepare(
            "INSERT INTO posts (title, author, content, password, views) VALUES (?, ?, ?, ?, 1)"
        ).bind(title, author, content, password).run();

        return new Response(JSON.stringify({ success: true, id: info.meta.last_row_id }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
