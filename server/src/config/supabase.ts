import { createClient } from '@supabase/supabase-js';

// URL dan kunci API dari dashboard Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vywgvjolhijtlwoodcou.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
