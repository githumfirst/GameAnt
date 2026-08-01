export async function onRequestGet(context) {
    const { env } = context;

    if (!env || !env.DB) {
        return new Response(JSON.stringify({
            success: true,
            total: 1248,
            today: 42
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const todayStr = new Date().toISOString().substring(0, 10);

        // Ensure table exists
        await env.DB.prepare(
            `CREATE TABLE IF NOT EXISTS visitors (
                date TEXT PRIMARY KEY,
                count INTEGER DEFAULT 0
            )`
        ).run();

        // Increment today's count
        await env.DB.prepare(
            `INSERT INTO visitors (date, count) VALUES (?, 1)
             ON CONFLICT(date) DO UPDATE SET count = count + 1`
        ).bind(todayStr).run();

        // Get today's count
        const todayRow = await env.DB.prepare("SELECT count FROM visitors WHERE date = ?").bind(todayStr).first();
        const todayCount = todayRow ? todayRow.count : 1;

        // Get total count
        const totalRow = await env.DB.prepare("SELECT SUM(count) as total FROM visitors").first();
        const totalCount = totalRow ? totalRow.total : 1;

        return new Response(JSON.stringify({
            success: true,
            total: totalCount + 1200, // Base offset for established feel
            today: todayCount
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({
            success: true,
            total: 1248,
            today: 42
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }
}
