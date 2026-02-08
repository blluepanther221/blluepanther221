import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Comic Book API is running' });
});

app.get('/api/comics', async (req, res) => {
    try {
        const { search, limit = 50 } = req.query;

        let query = supabase
            .from('comics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data, count: data?.length || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('comics')
            .select(`
                *,
                chapters (
                    id,
                    chapter_number,
                    title,
                    pages_count,
                    created_at
                )
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Comic not found' });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/comics', async (req, res) => {
    try {
        const { title, author, description, cover_image, status } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const { data, error } = await supabase
            .from('comics')
            .insert([{
                title,
                author,
                description,
                cover_image,
                status: status || 'Ongoing'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, cover_image, status } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (author !== undefined) updates.author = author;
        if (description !== undefined) updates.description = description;
        if (cover_image !== undefined) updates.cover_image = cover_image;
        if (status !== undefined) updates.status = status;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('comics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/comics/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('comics')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Comic deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/comics/:comicId/chapters', async (req, res) => {
    try {
        const { comicId } = req.params;
        const { chapter_number, title, pages_count } = req.body;

        if (!chapter_number || !title) {
            return res.status(400).json({ 
                success: false, 
                error: 'Chapter number and title are required' 
            });
        }

        const { data, error } = await supabase
            .from('chapters')
            .insert([{
                comic_id: comicId,
                chapter_number,
                title,
                pages_count: pages_count || 0
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/chapters/:chapterId/pages', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { pages } = req.body;

        if (!Array.isArray(pages) || pages.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Pages array is required' 
            });
        }

        const pagesData = pages.map((page, index) => ({
            chapter_id: chapterId,
            page_number: page.page_number || index + 1,
            image_url: page.image_url
        }));

        const { data, error } = await supabase
            .from('pages')
            .insert(pagesData)
            .select();

        if (error) throw error;

        await supabase
            .from('chapters')
            .update({ pages_count: pages.length })
            .eq('id', chapterId);

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/chapters/:chapterId/pages', async (req, res) => {
    try {
        const { chapterId } = req.params;

        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('chapter_id', chapterId)
            .order('page_number', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data, count: data?.length || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const { data: comics } = await supabase
            .from('comics')
            .select('id', { count: 'exact' });

        const { data: chapters } = await supabase
            .from('chapters')
            .select('id', { count: 'exact' });

        const { data: pages } = await supabase
            .from('pages')
            .select('id', { count: 'exact' });

        res.json({
            success: true,
            data: {
                total_comics: comics?.length || 0,
                total_chapters: chapters?.length || 0,
                total_pages: pages?.length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Comic Book API server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
