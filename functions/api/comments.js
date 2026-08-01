export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const postId = url.searchParams.get('post_id');

    if (!postId) {
        return new Response(JSON.stringify({ success: false, error: "post_id required." }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (!env || !env.DB) {
        return new Response(JSON.stringify({ success: true, comments: [] }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, post_id, author, content, created_at FROM comments WHERE post_id = ? ORDER BY id ASC"
        ).bind(postId).all();

        return new Response(JSON.stringify({ success: true, comments: results }), {
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
        const { post_id, author, content, password } = body;

        if (!post_id || !author || !content || !password) {
            return new Response(JSON.stringify({ success: false, error: "Missing required fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env || !env.DB) {
            return new Response(JSON.stringify({
                success: true,
                comment: { id: Date.now(), post_id, author, content, created_at: new Date().toISOString() }
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const info = await env.DB.prepare(
            "INSERT INTO comments (post_id, author, content, password) VALUES (?, ?, ?, ?)"
        ).bind(post_id, author, content, password).run();

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

export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { id, password } = body;

        if (!id || !password) {
            return new Response(JSON.stringify({ success: false, error: "Comment ID and password required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!env || !env.DB) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const existing = await env.DB.prepare(
            "SELECT password FROM comments WHERE id = ?"
        ).bind(id).first();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: "Comment not found." }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (existing.password !== password) {
            return new Response(JSON.stringify({ success: false, error: "Incorrect password." }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
