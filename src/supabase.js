import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getComics(searchQuery = '') {
    let query = supabase
        .from('comics')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    return { data, error };
}

export async function getComicById(id) {
    const { data, error } = await supabase
        .from('comics')
        .select(`
            *,
            chapters (*)
        `)
        .eq('id', id)
        .maybeSingle();
    
    return { data, error };
}

export async function getChapterPages(chapterId) {
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('page_number', { ascending: true });
    
    return { data, error };
}

export async function saveReadingProgress(userId, comicId, chapterId, pageNumber) {
    const { data, error } = await supabase
        .from('reading_progress')
        .upsert({
            user_id: userId,
            comic_id: comicId,
            chapter_id: chapterId,
            page_number: pageNumber,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,comic_id'
        });
    
    return { data, error };
}

export async function getUserLibrary(userId) {
    const { data, error } = await supabase
        .from('reading_progress')
        .select(`
            *,
            comics (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
    
    return { data, error };
}
