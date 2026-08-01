export async function onRequestGet(context) {
    const { params, env } = context;
    const postId = params.id;

    if (!env || !env.DB) {
        return new Response(JSON.stringify({ success: false, error: "DB binding not available." }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Increment view count
        await env.DB.prepare("UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?").bind(postId).run();

        const post = await env.DB.prepare(
            "SELECT id, title, author, content, COALESCE(views, 0) AS views, created_at FROM posts WHERE id = ?"
        ).bind(postId).first();

        if (!post) {
            return new Response(JSON.stringify({ success: false, error: "Post not found." }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: true, post }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPut(context) {
    const { params, request, env } = context;
    const postId = params.id;

    try {
        const body = await request.json();
        const { title, content, password } = body;

        if (!password || !title || !content) {
            return new Response(JSON.stringify({ success: false, error: "Title, content and password are required." }), {
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
            "SELECT password FROM posts WHERE id = ?"
        ).bind(postId).first();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: "Post not found." }), {
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

        await env.DB.prepare(
            "UPDATE posts SET title = ?, content = ? WHERE id = ?"
        ).bind(title, content, postId).run();

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

export async function onRequestDelete(context) {
    const { params, request, env } = context;
    const postId = params.id;

    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return new Response(JSON.stringify({ success: false, error: "Password required." }), {
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
            "SELECT password FROM posts WHERE id = ?"
        ).bind(postId).first();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: "Post not found." }), {
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

        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(postId).run();

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
